'use client'

import {useState} from 'react'
import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, getToolName, isToolUIPart, type UIMessage} from 'ai'
import Markdown from 'react-markdown'
import recordings from '@/data/examples.json'

/**
 * The four examples are recordings, not mock-ups: answer text, tool calls and GROQ
 * queries exactly as the agent produced them, written by scripts/record-examples.mjs.
 * Opening one costs nothing and takes no time, which is the point — the live path is
 * fifteen to sixty seconds and a paid key. Typing your own question still runs live.
 */
type Recording = (typeof recordings.examples)[number]

/** Which endpoint a tool came from — the two halves of the product, made visible. */
const TOOL_ORIGIN: Record<string, string> = {
  knowledge_base_read: 'knowledge base',
  groq_query: 'dataset',
  schema_explorer: 'dataset',
  array_field_reader: 'dataset',
}

function Tools({calls}: {calls: string[]}) {
  if (calls.length === 0) return null

  const counted = calls.reduce<Record<string, number>>((acc, name) => {
    acc[name] = (acc[name] ?? 0) + 1
    return acc
  }, {})

  return (
    <ul className="mb-3 flex flex-wrap gap-1.5">
      {Object.entries(counted).map(([name, n]) => (
        <li
          key={name}
          className="rounded border border-neutral-300 px-1.5 py-0.5 font-mono text-[11px] text-neutral-600 dark:border-neutral-700 dark:text-neutral-400"
        >
          {name}
          {n > 1 ? ` ×${n}` : ''}
          <span className="ml-1 text-neutral-400 dark:text-neutral-600">
            {TOOL_ORIGIN[name] ?? 'context'}
          </span>
        </li>
      ))}
    </ul>
  )
}

const PROSE =
  'text-[15px] leading-relaxed [&_h2]:mt-4 [&_h2]:text-base [&_h2]:font-semibold ' +
  '[&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal ' +
  '[&_ol]:pl-5 [&_li]:mb-1 [&_strong]:font-semibold [&_em]:italic ' +
  '[&_a]:underline [&_a]:decoration-neutral-400 [&_code]:font-mono [&_code]:text-[13px]'

function Answer({text}: {text: string}) {
  return (
    <div className={PROSE}>
      <Markdown>{text}</Markdown>
    </div>
  )
}

function Speaker({who}: {who: string}) {
  return (
    <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400">{who}</p>
  )
}

/** The queries a visitor would never see, which is the clearest evidence of how it answered. */
function Queries({recording}: {recording: Recording}) {
  const queries = recording.tools
    .map((t) => (t.input as {query?: string}).query)
    .filter((q): q is string => Boolean(q))
  if (queries.length === 0) return null

  return (
    <details className="mt-4">
      <summary className="cursor-pointer font-mono text-[11px] uppercase tracking-wider text-neutral-400">
        the {queries.length === 1 ? 'query' : 'queries'} it ran
      </summary>
      <ul className="mt-2 flex flex-col gap-2">
        {queries.map((query, i) => (
          <li
            key={i}
            className="overflow-x-auto rounded border border-neutral-200 bg-neutral-50 px-2.5 py-2 font-mono text-[12px] text-neutral-700 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300"
          >
            {query}
          </li>
        ))}
      </ul>
    </details>
  )
}

export default function Page() {
  const [input, setInput] = useState('')
  const [shown, setShown] = useState<Recording | null>(null)
  const {messages, sendMessage, status, error} = useChat({
    transport: new DefaultChatTransport({api: '/api/chat'}),
  })

  const busy = status === 'submitted' || status === 'streaming'

  const ask = (text: string) => {
    if (!text.trim() || busy) return
    setShown(null)
    sendMessage({text})
    setInput('')
  }

  const idle = messages.length === 0

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Open Call</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Free, in-person hackathons in Europe after October 2026 — answered from the organisers&rsquo;
          own pages, with the source for every fact, and <em>not stated</em> when nobody says.
        </p>
      </header>

      {idle && (
        <ul className="flex flex-col gap-2">
          {recordings.examples.map((example) => (
            <li key={example.question}>
              <button
                onClick={() => setShown(shown === example ? null : example)}
                aria-expanded={shown === example}
                className={`w-full rounded-lg border px-3 py-2 text-left text-sm transition ${
                  shown === example
                    ? 'border-neutral-400 dark:border-neutral-600'
                    : 'border-neutral-200 hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600'
                }`}
              >
                {example.question}
              </button>
            </li>
          ))}
        </ul>
      )}

      {idle && shown && (
        <article>
          <Speaker who="open call" />
          <Tools calls={shown.tools.map((t) => t.name)} />
          <Answer text={shown.answer} />
          <Queries recording={shown} />
          <p className="mt-4 border-t border-neutral-200 pt-3 text-xs text-neutral-500 dark:border-neutral-800">
            Recorded {recordings.recordedAt} from {recordings.model}, unedited — it took{' '}
            {shown.seconds} seconds and {shown.tools.length} tool calls to produce. Ask your own
            question below to run the same agent live.
          </p>
        </article>
      )}

      <div className="flex flex-1 flex-col gap-6">
        {messages.map((message: UIMessage) => (
          <article key={message.id}>
            <Speaker who={message.role === 'user' ? 'you' : 'open call'} />
            {message.role === 'assistant' && (
              <Tools calls={message.parts.filter(isToolUIPart).map(getToolName)} />
            )}
            {message.parts.map((part, i) =>
              part.type === 'text' ? (
                message.role === 'user' ? (
                  <p key={i} className="text-[15px] leading-relaxed">
                    {part.text}
                  </p>
                ) : (
                  <Answer key={i} text={part.text} />
                )
              ) : null,
            )}
          </article>
        ))}

        {busy && <p className="text-sm text-neutral-400">reading the sources…</p>}

        {error && (
          <p className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:text-red-400">
            {error.message}
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ask(input)
        }}
        className="sticky bottom-4 flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about a hackathon…"
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500 dark:border-neutral-700 dark:bg-neutral-950"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-40 dark:bg-white dark:text-neutral-900"
        >
          Ask
        </button>
      </form>
    </main>
  )
}
