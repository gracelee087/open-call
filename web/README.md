# web — the agent

Next.js app that connects to two Sanity Context MCP endpoints and answers questions about the
hackathons in the `dmar00cc` dataset.

Setup, environment variables and the reasoning behind the design are in the [root
README](../README.md). In short:

```bash
npm install
cp .env.local.example .env.local   # fill SANITY_API_READ_TOKEN and ANTHROPIC_API_KEY
npm run dev                        # http://localhost:3000
```

- `lib/context.ts` — opens both endpoints, inlines their `initial_context` payloads into the
  system prompt, merges the remaining tools.
- `app/api/chat/route.ts` — the chat endpoint.
- `scripts/check-mcp.mjs` — prints the merged tool set; run this first if the agent cannot see
  your content.
- `scripts/record-examples.mjs` — re-records `data/examples.json`, the answers the front page
  opens instantly.
