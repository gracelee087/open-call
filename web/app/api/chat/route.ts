import {anthropic} from '@ai-sdk/anthropic'
import {convertToModelMessages, stepCountIs, streamText, type UIMessage} from 'ai'
import {openContext} from '@/lib/context'

export const maxDuration = 60

export async function POST(request: Request) {
  const {messages}: {messages: UIMessage[]} = await request.json()

  let context
  try {
    context = await openContext()
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not reach Sanity Context'
    return Response.json({error: message}, {status: 502})
  }

  const result = streamText({
    model: anthropic('claude-sonnet-5'),
    system: context.system,
    messages: await convertToModelMessages(messages),
    tools: context.tools,
    // Reading an entry usually leads to a second look somewhere else; give it room
    // to follow that without letting it wander.
    stopWhen: stepCountIs(10),
    // Browsers cancel these: a visitor navigates away mid-answer, or presses stop.
    // Without the signal and onAbort, both MCP connections stay open for the life of
    // the process, because neither onEnd nor onError fires on an abort.
    abortSignal: request.signal,
    onEnd: () => context.close(),
    onAbort: () => context.close(),
    onError: () => context.close(),
  })

  return result.toUIMessageStreamResponse()
}
