import {createMCPClient} from '@ai-sdk/mcp'
import type {ToolSet} from 'ai'

/**
 * Sanity serves one content source per Context MCP endpoint — a knowledge base or a
 * dataset, never both — so this product arrives over two connections:
 *
 *   open-call               the knowledge base: what the pages actually say
 *   open-call-data-dataset  the dataset: filters over what we recorded, with sources
 *
 * Both endpoints expose a tool called `initial_context`, and merging two tool maps
 * would silently drop one of them along with either the knowledge base outline or the
 * schema overview. So we follow Sanity's documented alternative: fetch each payload
 * over HTTP, concatenate them into the system prompt, and leave the tool out entirely.
 * That also removes a round trip from the start of every conversation.
 */

const ORG = process.env.SANITY_ORG_ID ?? 'oa9zzr60i'

const ENDPOINTS = ['open-call', 'open-call-data-dataset'] as const

const base = (name: string) =>
  `https://api.sanity.io/v1/context/organizations/${ORG}/mcp/${name}`

const PREAMBLE = `You help someone decide which European hackathon to apply to.

Two things reach you through the same conversation: entries written from the event pages
themselves, and a small structured dataset recording what we read, where we read it, and
where sources disagreed. Reach for the dataset when the question is a filter — still open,
which country, cash prizes, free entry — and for the entries when the question is about
what a page actually says.

Cite the source of every fact. Prefer an organiser's own page over a listing site.

Quotation marks mean the words between them appear in the source, in that order. If you
are characterising a page rather than quoting it, write it as your own sentence. Never
put quotation marks around a sentence you assembled, however faithful it feels.

A date on a page is only the deadline the page says it is. A refund cut-off, a cancellation
date and a ticket sale ending are not application deadlines, and reading one as the other
is the specific mistake this dataset was built after making.

If nothing states an answer, say it is not stated. That is a real answer here: the dataset
records silence explicitly rather than leaving a blank, so "not stated" means someone read
the page and it was silent, not that nobody looked.

Answer the person, not yourself. No narration of which query you are about to run.`

export type OpenContext = {
  system: string
  tools: ToolSet
  close: () => Promise<void>
}

type Client = Awaited<ReturnType<typeof createMCPClient>>

const closeAll = async (clients: Client[]) => {
  await Promise.allSettled(clients.map((client) => client.close()))
}

export async function openContext(): Promise<OpenContext> {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('SANITY_API_READ_TOKEN is not set')

  const headers = {Authorization: `Bearer ${token}`}

  // Open both connections before anything can throw, and settle rather than race: if one
  // endpoint fails while the other has already connected, the survivor still has to be
  // closed. Nothing else holds a reference to it.
  const settled = await Promise.allSettled(
    ENDPOINTS.map((name) =>
      createMCPClient({transport: {type: 'http', url: base(name), headers}}),
    ),
  )
  const clients = settled.flatMap((r) => (r.status === 'fulfilled' ? [r.value] : []))

  try {
    const failed = settled.findIndex((r) => r.status === 'rejected')
    if (failed !== -1) {
      throw new Error(
        `${ENDPOINTS[failed]}: ${(settled[failed] as PromiseRejectedResult).reason}`,
      )
    }

    const [initialContexts, toolSets] = await Promise.all([
      Promise.all(
        ENDPOINTS.map(async (name) => {
          const res = await fetch(`${base(name)}/initial-context`, {headers})
          if (!res.ok) throw new Error(`${name}: initial-context ${res.status}`)
          return res.text()
        }),
      ),
      Promise.all(
        clients.map(async (client) =>
          Object.fromEntries(
            Object.entries(await client.tools()).filter(([name]) => name !== 'initial_context'),
          ),
        ),
      ),
    ])

    // streamText can reach onEnd, onError and onAbort for the same request, so closing
    // has to be safe to call more than once.
    let closing: Promise<void> | null = null

    return {
      system: [PREAMBLE, ...initialContexts].join('\n\n---\n\n'),
      tools: Object.assign({}, ...toolSets),
      close: () => (closing ??= closeAll(clients)),
    }
  } catch (error) {
    await closeAll(clients)
    throw error
  }
}
