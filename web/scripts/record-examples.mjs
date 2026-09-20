/**
 * Records what the agent actually answers, so the front page can open instantly and
 * cost nothing to visit.
 *
 * Nothing here is written by hand: each question goes through the same /api/chat route
 * a visitor would hit, and the answer text, the tool calls and the GROQ queries are
 * saved exactly as they came back. The page labels them as recordings and says when.
 *
 * Run with the dev server up:  node scripts/record-examples.mjs
 */
import {writeFileSync, mkdirSync} from 'node:fs'
import {dirname, join} from 'node:path'
import {fileURLToPath} from 'node:url'

const QUESTIONS = [
  'Which of these can I still apply to, and what is the deadline?',
  'If I go to a CASSINI local hackathon, can I win the 9,000 EUR?',
  'Which prizes are real cash?',
  'What do the listing sites get wrong?',
]

const API = process.env.CHAT_URL ?? 'http://localhost:3000/api/chat'
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'examples.json')

async function ask(question) {
  const started = Date.now()
  const res = await fetch(API, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({
      messages: [{id: 'q', role: 'user', parts: [{type: 'text', text: question}]}],
    }),
  })
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)

  const stream = await res.text()
  const answer = []
  const tools = []

  for (const line of stream.split('\n')) {
    if (!line.startsWith('data: ')) continue
    let event
    try {
      event = JSON.parse(line.slice(6))
    } catch {
      continue
    }
    if (event.type === 'text-delta') answer.push(event.delta ?? '')
    if (event.type === 'tool-input-available') {
      tools.push({
        name: event.toolName,
        // The GROQ a visitor never sees is the clearest evidence that the answer
        // could not have come from a keyword search.
        input: event.input,
      })
    }
  }

  return {
    question,
    answer: answer.join(''),
    tools,
    seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
  }
}

const examples = []
for (const question of QUESTIONS) {
  process.stdout.write(`  ${question}\n`)
  const result = await ask(question)
  process.stdout.write(
    `    ${result.seconds}s, ${result.tools.length} tool calls, ${result.answer.length} chars\n`,
  )
  examples.push(result)
}

mkdirSync(dirname(OUT), {recursive: true})
writeFileSync(
  OUT,
  JSON.stringify(
    {
      recordedAt: new Date().toISOString().slice(0, 10),
      model: 'claude-sonnet-5',
      note: 'Unedited. Answer text, tool calls and queries exactly as the agent produced them.',
      examples,
    },
    null,
    2,
  ) + '\n',
)

console.log(`\nwrote ${examples.length} recordings to data/examples.json`)
