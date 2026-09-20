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

Cite the source of every fact. Prefer an organiser's own page over a listing site. If
nothing states an answer, say it is not stated; that is a real answer here, and the dataset
records it explicitly rather than leaving a blank.`

export type OpenContext = {
  system: string
  tools: ToolSet
  close: () => Promise<void>
}

export async function openContext(): Promise<OpenContext> {
  const token = process.env.SANITY_API_READ_TOKEN
  if (!token) throw new Error('SANITY_API_READ_TOKEN is not set')

  const headers = {Authorization: `Bearer ${token}`}

  const opened = await Promise.all(
    ENDPOINTS.map(async (name) => {
      const url = base(name)

      const [initialContext, client] = await Promise.all([
        fetch(`${url}/initial-context`, {headers}).then((res) => {
          if (!res.ok) throw new Error(`${name}: initial-context ${res.status}`)
          return res.text()
        }),
        createMCPClient({transport: {type: 'http', url, headers}}),
      ])

      const tools = Object.fromEntries(
        Object.entries(await client.tools()).filter(([name]) => name !== 'initial_context'),
      )
      return {initialContext, tools, client}
    }),
  )

  return {
    system: [PREAMBLE, ...opened.map((o) => o.initialContext)].join('\n\n---\n\n'),
    tools: Object.assign({}, ...opened.map((o) => o.tools)),
    close: async () => {
      await Promise.all(opened.map((o) => o.client.close()))
    },
  }
}
