'use client'

import {useState} from 'react'
import {useChat} from '@ai-sdk/react'
import {DefaultChatTransport, getToolName, isToolUIPart, type UIMessage} from 'ai'

const EXAMPLES = [
  'Which of these can I still apply to, and what is the deadline?',
  'Is Odoo Hackathon #6 actually free?',
  'Which prizes are real cash?',
  'What do the listing sites get wrong?',
]

/** Which endpoint a tool came from — the two halves of the product, made visible. */
const TOOL_ORIGIN: Record<string, string> = {
  knowledge_base_read: 'knowledge base',
  groq_query: 'dataset',
  schema_explorer: 'dataset',
  array_field_reader: 'dataset',
}

function ToolTrace({message}: {message: UIMessage}) {
  const calls = message.parts.filter(isToolUIPart).map(getToolName)
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

export default function Page() {
  const [input, setInput] = useState('')
  const {messages, sendMessage, status, error} = useChat({
    transport: new DefaultChatTransport({api: '/api/chat'}),
  })

  const busy = status === 'submitted' || status === 'streaming'

  const ask = (text: string) => {
    if (!text.trim() || busy) return
    sendMessage({text})
    setInput('')
  }

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Open Call</h1>
        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
          Free, in-person hackathons in Europe after October 2026 — answered from the organisers&rsquo;
          own pages, with the source for every fact, and{' '}
          <em>not stated</em> when nobody says.
        </p>
      </header>

      {messages.length === 0 && (
        <ul className="flex flex-col gap-2">
          {EXAMPLES.map((q) => (
            <li key={q}>
              <button
                onClick={() => ask(q)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-left text-sm transition hover:border-neutral-400 dark:border-neutral-800 dark:hover:border-neutral-600"
              >
                {q}
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-1 flex-col gap-6">
        {messages.map((message) => (
          <article key={message.id}>
            <p className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              {message.role === 'user' ? 'you' : 'open call'}
            </p>
            {message.role === 'assistant' && <ToolTrace message={message} />}
            <div className="whitespace-pre-wrap text-[15px] leading-relaxed">
              {message.parts.map((part, i) =>
                part.type === 'text' ? <span key={i}>{part.text}</span> : null,
              )}
            </div>
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
