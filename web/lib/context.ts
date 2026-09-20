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

Two things reach you through the same conversation.

The knowledge base holds what the pages themselves say, at length and in their own words:
the sleeping arrangements, the deposit refund conditions, the eligibility clauses nobody
puts in a summary. Read the entry for an event before answering anything about that event.
Its id is in the outline below, and knowledge_base_read needs that id as well as the paths.

The dataset holds what we recorded from those pages: one claim per field, each carrying the
page it was read on and a verdict where sources disagreed. Reach for it to compare events,
to filter, and to check whether a page has been overtaken by a newer one.

Most real questions want both. "Is this one free" is a dataset claim and a paragraph of
conditions around it. Never attribute anything to an entry you did not open.

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
  // allSettled so one refusal cannot strand the others. A close that fails is exactly
  // the leak this whole file is about, so it gets said out loud rather than swallowed.
  const results = await Promise.allSettled(clients.map((client) => client.close()))
  for (const result of results) {
    if (result.status === 'rejected') console.error('context: close failed', result.reason)
  }
}

const describe = (reason: unknown) =>
  reason instanceof Error ? reason.message : String(reason)

export async function openContext(signal?: AbortSignal): Promise<OpenContext> {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('SANITY_API_READ_TOKEN is not set')

  const headers = {Authorization: `Bearer ${token}`}

  // A hung Sanity API would otherwise hold the request until the platform kills the
  // function, with both clients open and no catch ever reached.
  const deadline = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(10_000)])
    : AbortSignal.timeout(10_000)

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
    const rejected = settled.flatMap((r, i) =>
      r.status === 'rejected' ? [`${ENDPOINTS[i]}: ${describe(r.reason)}`] : [],
    )
    if (rejected.length > 0) throw new Error(rejected.join('; '))

    const [initialContexts, toolSets] = await Promise.all([
      Promise.all(
        ENDPOINTS.map(async (name) => {
          const res = await fetch(`${base(name)}/initial-context`, {headers, signal: deadline})
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

    // initial_context is the collision we know about and handle above. Any other shared
    // name would be silently overwritten here and its endpoint would go unreachable,
    // which is the exact failure this file exists to avoid - so it is not left to luck.
    const tools: ToolSet = {}
    for (const [i, toolSet] of toolSets.entries()) {
      for (const [name, tool] of Object.entries(toolSet)) {
        if (name in tools) {
          throw new Error(
            `Both Context endpoints serve a tool called ${name}. Merging would hide ` +
              `${ENDPOINTS[i]}'s. Inline it the way initial_context is inlined, or namespace it.`,
          )
        }
        tools[name] = tool
      }
    }

    // streamText can reach onEnd, onError and onAbort for the same request, so closing
    // has to be safe to call more than once.
    let closing: Promise<void> | null = null

    return {
      system: [PREAMBLE, ...initialContexts].join('\n\n---\n\n'),
      tools,
      close: () => (closing ??= closeAll(clients)),
    }
  } catch (error) {
    await closeAll(clients)
    throw error
  }
}
