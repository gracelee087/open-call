# Open Call

An agent that answers questions about free, in-person hackathons in Europe starting after
October 2026 — and tells you where every fact came from, which source has gone out of date,
and when nobody says.

Built for the [DEV × Sanity Challenge](https://dev.to/challenges/sanity-2026-09-16), Path One.

**Sanity project `dmar00cc`, dataset `production`** — public, no token needed:

```
https://dmar00cc.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="event"]
```

## The problem, measured

On 20 September 2026 I went looking for a hackathon to go to. Five listing sites, and no two
agreed on what exists:

| Listing site | European hackathons it showed for Oct–Dec 2026 |
| --- | --- |
| `dev.events` | 5 — Junction and CASSINI missing |
| `mlh.com` | 3 of its 74 events, all in the UK |
| `luma.com/tech-europe` | 4 dates, mostly already past |
| `hackathon.com` | **0** — *"There is no upcoming hackathons found in 'Europe'"* |
| `openhackathons.org` | unreadable, the listing never renders without JavaScript |

Fifteen were open.

And where a page did exist, it disagreed with itself or with the organiser's other pages:

- **Junction** describes travel grants in the present tense — *"Travel grants are available on a
  limited basis"* — on a page whose grant deadline passed on 6 September. Its own application
  platform says they *"have been closed for international participants."*
- **BaselHack** puts the dates on its homepage and in a blog post, but not on the page called
  *Event*. It promises *"fantastic prize money"* and never names a figure; the CHF 25,000–35,000
  that circulates is the sponsorship budget for venue and catering, not a prize pot.
- **Odoo** gives its cancellation cut-off twice on one page, as 13 November in one section and
  14 November in another.
- **Wikipedia's** Junction article was last edited in June 2026 and still describes the 2025
  edition — whose dates are one day off from 2026's, which is exactly the kind of near-miss that
  gets copied.

None of that is visible to a keyword search. You have to open every page and hold them against
each other.

## What the content model does about it

Nothing in this project stores a fact without storing where it came from.

```ts
// A yes/no fact that always says where it came from.
sourcedClaim {
  value: 'yes' | 'no' | 'not-stated'
  note:  string     // the qualifier, in the source's own words
  basis: → source   // the page it was read on
}
```

Three values, not two. A page that never mentions travel grants is not a page that says there
are none, and collapsing those two into `false` is how a dataset starts lying. Every contested
field on an event — free entry, students only, travel costs, accommodation, whether a prize is
cash — is one of these.

The schema refuses to store a claim that cannot point at a source:

```
A stated value needs a source. Either set it to "Not stated in the source",
or say where you read it.
```

and refuses a prize figure with nothing behind it:

```
A prize figure needs a source. Fill in "Prize is cash" and say where the figure was read.
```

Three document types, one object:

| Type | What it holds |
| --- | --- |
| `source` | One page we read. Who published it, when it was written, **when we read it**, and which edition of the event it is talking about. |
| `statement` | One thing one source said about one aspect of one event, **quoted verbatim**, with a verdict: accepted, superseded, incorrect, or not looked at yet. |
| `event` | One edition. Junction 2026 and Junction 2025 are two documents. Dates, venues, sponsors, and the five sourced claims. |
| `sourcedClaim` | The object above. Defined once, reused five times. |

Statements come first and event fields are filled from them, never the other way round, so a
summary that turns out wrong can always be traced back to the sentence it came from.

The collection rules live in the schema rather than a README: `eventStart` before 2026-10-01 is
rejected, and `format` has no `online` option.

## How the agent reads it

Sanity Context serves **one content source per MCP endpoint**, so this runs on two:

```
open-call               knowledge base   what the pages actually say
open-call-data-dataset  dataset          filters over what we recorded
```

Both expose a tool named `initial_context`, so merging their tool maps would silently drop one
of them — along with either the knowledge base outline or the schema overview. Instead both
payloads are fetched over HTTP and inlined into the system prompt, and the tool is left out of
the tool set entirely. That is [Sanity's documented
pattern](https://www.sanity.io/docs/ai/sanity-context-initial-context), and it also removes a
round trip from the start of every conversation. See [`web/lib/context.ts`](web/lib/context.ts).

The model ends up with five tools and decides which half of the product to reach for:

```
"Which prizes are real cash?"        → groq_query
"Is Odoo Hackathon #6 free?"         → knowledge_base_read
"What can I still apply to?"         → both, six calls
```

## What the knowledge base caught that I did not

Nine sources went in: five organiser pages, an application platform, Wikipedia, three listing
sites deliberately included so they would have something to disagree with, and the project's own
dataset. 72 documents, 9 entries.

The build raised one conflict, and it was not one I had predicted. The Odoo registration page
contradicts **itself** about the cancellation cut-off — 13 November in one section, 14 November
in another. I had read that page closely enough to quote from it and never noticed.

Chasing it down turned up a mistake in my own data: I had recorded `applyBy: 2026-11-13` for
Odoo, which is not an application deadline at all. It is the cancellation refund cut-off, and I
had copied it from a search summary rather than the page. The agent now warns against exactly
that inference.

Resolving the issue wrote an instruction that shapes every future build. Five more were written
by hand, one per source, so the knowledge base carries what the sources are worth:

> *This article describes Junction 2025, not Junction 2026. It was last edited in June 2026 and
> still has no 2026 content. Never use its dates, prize figures or participant numbers for the
> 2026 edition.*

> *These listings are incomplete. Absence from them is not evidence that an event does not exist…
> Never answer "there are none" or "it is not listed" on the strength of these pages.*

The build then wrote an entry I had not asked for — `source_reliability`, tagged `[core]`, with
topics for each aggregator omission, the Wikipedia date lag and the BaselHack inconsistency. The
instructions changed the shape of the index, not just its wording.

## Running it

```bash
# Studio — schema, content, and the seed
cd studio
npm install
npm run dev                                        # http://localhost:3333
npx sanity exec scripts/seed.ts --with-user-token  # 37 documents

# Agent
cd ../web
npm install
cp .env.local.example .env.local                   # then fill both keys
npm run dev                                        # http://localhost:3000
```

`web/.env.local` needs two things:

- `SANITY_API_READ_TOKEN` — an organisation token with Context Viewer permission, from
  **Manage → API → Tokens** at the organisation level. The Context MCP endpoints will not open
  without one, and the dataset must have a deployed Studio (`npx sanity deploy`).
- `ANTHROPIC_API_KEY` — or swap the provider in `web/app/api/chat/route.ts`; the contest allows
  any framework and any model.

Two scripts are worth running on their own:

```bash
node web/scripts/check-mcp.mjs        # connects both endpoints, prints the merged tool set
node web/scripts/record-examples.mjs  # re-records the front page examples
```

The four examples on the front page are recordings, not mock-ups: `web/data/examples.json` holds
the answer text, the tool calls and the GROQ queries exactly as the agent produced them, written
by that second script. They are bundled into a statically prerendered page, so opening one costs
no API call and no waiting — the live path behind the text box takes fifteen to sixty seconds and
a paid key. Each recording shows the queries it ran, which is the part a visitor would never
otherwise see.

## What this does not do

- **Five events.** Enough to show the modelling and to find real disagreements, not enough to
  plan a year around. Every listing site surveyed above showed five or fewer, which is the point,
  but it is still five.
- **No times, only dates.** Deadlines are stored as dates; the hour and the timezone are not
  modelled.
- **English sources only.**
- **The knowledge base does not catch numeric disagreement.** Across two builds in two unrelated
  domains it raised conflicts over wording and phrasing and never over two sources giving
  different figures for the same thing. The `statement` layer exists partly to cover that.

## Layout

```
studio/
  schemaTypes/     source.ts, statement.ts, event.ts, sourcedClaim.ts
  scripts/seed.ts  every fact, with the reasoning in comments
web/
  lib/context.ts   the two-endpoint connection
  app/api/chat/    the agent
  data/            recorded answers
```

Not investment advice, and not a substitute for reading the organiser's page before you book a
flight. That is rather the point.
