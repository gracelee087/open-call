/**
 * Hard gate 2: can one agent hold tools from more than one Context MCP endpoint?
 *
 * Sanity serves one content source per endpoint — a knowledge base or a dataset,
 * not both — so the two halves of this product arrive over two connections and have
 * to be merged client-side before the model ever sees them.
 *
 * Run:  node scripts/check-mcp.mjs
 */
import {createMCPClient} from '@ai-sdk/mcp'
import {readFileSync} from 'node:fs'
import {homedir} from 'node:os'
import {join} from 'node:path'

const ORG = 'oa9zzr60i'
const ENDPOINTS = ['open-call', 'open-call-data-dataset']

function token() {
  if (process.env.SANITY_API_READ_TOKEN) return process.env.SANITY_API_READ_TOKEN
  // Local convenience only: the CLI login this machine already has.
  const cfg = join(homedir(), '.config', 'sanity', 'config.json')
  return JSON.parse(readFileSync(cfg, 'utf8')).authToken
}

async function connect(name, auth) {
  const client = await createMCPClient({
    transport: {
      type: 'http',
      url: `https://api.sanity.io/v1/context/organizations/${ORG}/mcp/${name}`,
      headers: {Authorization: `Bearer ${auth}`},
    },
  })
  return {name, client, tools: await client.tools()}
}

const auth = token()
const connected = []

for (const name of ENDPOINTS) {
  try {
    const c = await connect(name, auth)
    connected.push(c)
    console.log(`  ${name.padEnd(16)} ${Object.keys(c.tools).join(', ')}`)
  } catch (err) {
    console.log(`  ${name.padEnd(16)} unavailable — ${err.message.split('\n')[0]}`)
  }
}

const merged = Object.assign({}, ...connected.map((c) => c.tools))
console.log(`\nmerged: ${Object.keys(merged).length} tools`)
console.log(Object.keys(merged).sort().map((t) => `  - ${t}`).join('\n'))

const collisions = Object.keys(merged).length < connected.reduce((n, c) => n + Object.keys(c.tools).length, 0)
if (collisions) {
  console.log(
    '\nNOTE: the endpoints share a tool name (initial_context is served by both).\n' +
      'Merging keeps the last one, so only one endpoint’s instructions and outline reach the model.',
  )
}

await Promise.all(connected.map((c) => c.client.close()))
