import {anthropic} from '@ai-sdk/anthropic'
import {convertToModelMessages, stepCountIs, streamText, type UIMessage} from 'ai'
import {openContext} from '@/lib/context'

/**
 * A five-event comparison honestly costs around eighty seconds and nine tool calls, so 60
 * is not enough. Vercel Hobby caps this at 60 regardless and that question will time out
 * there; the four recorded examples are served from a static page and never touch this
 * route, so the front page stays usable either way.
 */
export const maxDuration = 300

export async function POST(request: Request) {
  // Everything that can reject on a malformed body happens before anything is opened.
  // convertToModelMessages throws on unknown roles and broken parts, and this endpoint
  // is public: if it ran after openContext, a crafted POST would leak two MCP
  // connections per request, because streamText would never be reached to register the
  // callbacks that close them.
  let modelMessages
  try {
    const {messages}: {messages: UIMessage[]} = await request.json()
    modelMessages = await convertToModelMessages(messages)
  } catch {
    return Response.json({error: 'Could not read the messages in that request'}, {status: 400})
  }

  let context
  try {
    context = await openContext(request.signal)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not reach Sanity Context'
    return Response.json({error: message}, {status: 502})
  }

  try {
    const result = streamText({
      model: anthropic('claude-sonnet-5'),
      system: context.system,
      messages: modelMessages,
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
  } catch (error) {
    // streamText can throw before it has registered anything, and so can building the
    // response. Either way the connections are ours to close.
    await context.close()
    throw error
  }
}
