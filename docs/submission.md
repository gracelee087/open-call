# Open Call: an agent that says where every hackathon fact came from

*Submitted to the DEV × Sanity Challenge, Path One.*

---

## What I Built

On 20 September 2026 I went looking for a hackathon to go to in Europe. I opened five
listing sites and no two of them agreed on what exists.

| Listing site | European hackathons it showed for Oct–Dec 2026 |
| --- | --- |
| `dev.events` | 5 — Junction and CASSINI missing |
| `mlh.com` | 3 of its 74 events, all in the UK |
| `luma.com/tech-europe` | 4 dates, mostly already past |
| `hackathon.com` | **0** — *"There is no upcoming hackathons found in 'Europe'"* |
| `openhackathons.org` | unreadable; the listing never renders without JavaScript |

Between them, fifteen were open.

The pages that did exist disagreed with themselves. Junction advertises travel grants in
the present tense — *"Travel grants are available on a limited basis"* — on a page whose
grant deadline passed on 6 September; its own application platform says they *"have been
closed for international participants."* BaselHack puts its dates on the homepage and in a
blog post, but not on the page called **Event**. Odoo gives its cancellation cut-off twice
on one page, as 13 November in one section and 14 November in another.

**Open Call** is an agent that answers questions about free, in-person hackathons in Europe
starting after October 2026, and for every fact it gives you, tells you which page it was
read on, whether a newer page has overtaken it, and — the part that mattered most — when
nobody says at all.

The sharpest thing it found, it found in a PDF seventeen pages deep. The CASSINI hackathon
site advertises *"cash prizes up to 9,000 EUR."* Its Rules of Contest say:

> **No monetary prize will be awarded in the first stage ('Local Hackathons') by EUSPA.**

One team per city reaches the finals. For everyone else there is no EUSPA money at all. A
keyword search for "CASSINI prize" returns the 9,000. Both sentences are in the dataset
now, the website's marked superseded, and the agent leads with the rules.

## Demo

{% youtube H06X7CoVx8A %}

![The front page: four recorded questions and a box to ask your own](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/13-front-page.png)

![An answer with the GROQ it ran expanded underneath](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/10b-agent-queries.png)

![The same answer: one deadline is sourced, the rest are marked not stated](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/11-agent-answer.png)

The four example questions on the front page are **recordings, not mock-ups**:
`web/data/examples.json` holds the answer text, the tool calls and the GROQ queries exactly
as the agent produced them, written by `web/scripts/record-examples.mjs`. They are bundled
into a statically prerendered page, so opening one costs no API call and no waiting, and
each one will show you the GROQ it ran. The text box underneath runs the same agent live
against both MCP endpoints.

Ask it *"What do the listing sites get wrong?"* and it will tell you that hackathon.com
returned nothing on a day fifteen events were open, and that dev.events omitted a hackathon
with 2,000 builders and a €100,000 prize pool three weeks after the last event on its list.

## Code

**https://github.com/gracelee087/open-call**

```
studio/
  schemaTypes/     source.ts, statement.ts, event.ts, sourcedClaim.ts, isUnique.ts
  scripts/seed.ts  every fact, with the reasoning for it in comments
web/
  lib/context.ts   the two-endpoint MCP connection
  app/api/chat/    the agent
  data/            the recorded answers
```

Next.js 16 + AI SDK 7, Claude Sonnet 5, Sanity Studio v6. The root README has the setup and
an honest *What this does not do* section. TypeGen runs over the three queries that touch
the dataset directly and generates their result types beside the script that uses them.

## How I Used Sanity

### The content model is about provenance, not about hackathons

Nothing here stores a fact without storing where it came from.

```ts
// A yes/no fact that always says where it came from.
sourcedClaim {
  value: 'yes' | 'no' | 'not-stated'
  note:  string     // the qualifier, in the source's own words
  basis: → source   // the page it was read on
}
```

**Three values, not two.** A page that never mentions travel grants is not a page that says
there are none, and collapsing those two into `false` is how a dataset starts lying. Every
contested field on an event — free entry, students only, travel costs, accommodation,
whether a prize is cash — is one of these objects, defined once and reused five times.

Of the twenty-five claim slots in the dataset, **eleven are `not-stated`** — and every one
of them still points at the page that was read and found silent. That distinction is the
whole product. It is also the thing I got wrong first: an early version left those slots
empty, which reads as "nobody looked" and is exactly the boolean-plus-note design the three
values exist to avoid.

The schema refuses to store a claim that cannot point at a source:

> A stated value needs a source. Either set it to "Not stated in the source", or say where
> you read it.

![Studio: Free to enter set to Yes with its source cleared. The field is flagged and Publish is disabled](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/01-validation.png)

and refuses a prize figure with nothing behind it:

> A prize figure needs a source. Fill in "Prize is cash" and say where the figure was read.

The collection rules live in the schema rather than in a README: `eventStart` before
2026-10-01 is rejected with a message saying why, and `format` has no `online` option.
`source.url` and `event.slug` validate uniqueness asynchronously, because the seed script
finds documents by those fields and patches them in place — a duplicate would silently send
the next run's patch to whichever one it read first.

Three document types and one object:

| Type | What it holds |
| --- | --- |
| `source` | One page we read. Who published it, when it was written, **when we read it**, and which edition it is talking about — the field that catches Wikipedia describing 2025. |
| `statement` | One thing one source said about one aspect of one event, **quoted verbatim**, with a verdict: accepted, superseded, incorrect, or not looked at yet. |
| `event` | One edition. Junction 2026 and Junction 2025 would be two documents. |
| `sourcedClaim` | The object above. |

![Studio: statements, each quoted verbatim and tied to one event, one field and one source](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/03-statements.png)

Statements come first and event fields are filled from them, never the other way round, so
a summary that turns out wrong can be traced back to the sentence it came from.

### Two Context MCP endpoints, merged in the client

Sanity Context serves **one content source per endpoint**, so the product arrives over two:

```
open-call               knowledge base   what the pages actually say
open-call-data-dataset  dataset          filters over what we recorded
```

Both expose a tool named `initial_context`, so merging their tool maps would silently drop
one of them — along with either the knowledge base outline or the schema overview. Instead
both payloads are fetched over HTTP and concatenated into the system prompt, and the tool
is left out of the tool set entirely. That is Sanity's documented alternative, and it also
removes a round trip from the start of every conversation. The model ends up with five
tools and picks the half of the product it needs:

```
"Which prizes are real cash?"              → groq_query, then knowledge_base_read
"Can I win the 9,000 EUR at a local one?"  → knowledge_base_read, then groq_query
"What can I still apply to?"               → both, three calls
```

### What the Knowledge Base caught that I did not

Nine sources went in: five organiser pages, an application platform, Wikipedia, three
listing sites included deliberately so there would be something to disagree with, and the
project's own dataset. 72 documents, 9 entries — 73 and 11 after the rebuild described
below.

![Context: the knowledge base's nine sources](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/05-kb-sources.png)

The build raised one conflict, and it was not the one I expected. The Odoo registration
page contradicts **itself** about the cancellation cut-off — 13 November in one section, 14
November in another. I had read that page closely enough to quote from it and never noticed.

Chasing it down turned up a mistake in my own data. I had recorded `applyBy: 2026-11-13`
for Odoo. That is not an application deadline at all; it is the cancellation refund cut-off,
and I had taken it from a search summary rather than from the page. Resolving the issue
wrote an Instruction that shapes every future build. Five more were written by hand, one per
source, so the knowledge base carries what each source is worth:

> *This article describes Junction 2025, not Junction 2026. It was last edited in June 2026
> and still has no 2026 content. Never use its dates, prize figures or participant numbers
> for the 2026 edition.*

> *These listings are incomplete. Absence from them is not evidence that an event does not
> exist… Never answer "there are none" or "it is not listed" on the strength of these pages.*

![Context: the Odoo conflict, both sentences side by side, resolved into an instruction](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/08-kb-issue-detail.png)

![Context: the instructions, each tied to the sources it applies to](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/09-kb-instructions.png)

The next build then wrote an entry I had not asked for — `source_reliability`, with a topic
for each aggregator omission, the Wikipedia date lag, and the BaselHack inconsistency, plus
a hierarchy-of-trust table. The instructions changed the shape of the index, not just its
wording. It is the entry the agent reaches for when you ask what the listing sites get wrong.

### And what the dataset caught in the Knowledge Base

This is the part I did not plan and would not have found without both layers.

After fixing the seed, I read the generated Odoo entry directly over MCP. It says:

> Applications close **13 November 2026** [3]

The knowledge base had inherited my error and hardened it into prose, with a footnote
pointing at a statement about deposits. Meanwhile the dataset — rebuilt to record both
conflicting sentences verbatim and no `applyBy` at all — now says something the entry does
not: that no source states an application deadline for this event.

So the two layers caught each other. The knowledge base found the contradiction I had read
past; the structured dataset found the fact the knowledge base had invented. Neither alone
was enough, and a keyword search over either would have returned the wrong date with
confidence. The system prompt now carries the rule that came out of it:

> *A date on a page is only the deadline the page says it is. A refund cut-off, a
> cancellation date and a ticket sale ending are not application deadlines.*

Asked the same question today, the agent names the trap instead of falling into it:

> *"Odoo's registration page discusses a cancellation/refund cutoff, not an application
> deadline — and even that is internally inconsistent… No source states an actual
> application deadline for Odoo Hackathon #6, so I'm not going to present either of those
> dates as one."*

The entry itself took a rebuild to fix, and the rebuild made a new mistake. It now says *"No
application deadline is stated anywhere by the organiser."* But the rebuilt CASSINI entry
took a line from the organisers' recruitment page, *"12th Hackathon Applications closed"*,
and the next recorded answer told a participant that CASSINI #12 was closed to them. The
line sits next to a link to the organiser application form. It is about organisations
applying to host a local hackathon, not about participants. The dataset has no application
date and no registration status for CASSINI, so the answer had nothing behind it. One more
instruction, scoped to that page, and the entry now reads *"Applications for local
organisers for Hackathon #12 are now closed."* The recorded answer says CASSINI is *"Unclear
for participants."* That is the most the sources support.

![Context: the rebuilt knowledge base, eleven entries including a cross-event one](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/06-kb-entries.png)

## Sanity Project Details

- **Project ID: `dmar00cc`**
- **Dataset: `production`** — public, no token required:

```
https://dmar00cc.api.sanity.io/v2024-01-01/data/query/production?query=*[_type=="event"]
```

37 documents: 13 sources, 5 events, 19 statements. Two queries worth running:

```groq
// every claim nobody actually states, with the page we read it on
*[_type=="event"]{name, "silent": [free, studentsOnly, travelCovered, accommodation,
  prizeIsCash][value=="not-stated"]{note, "readOn": basis->url}}

// every source that has been overtaken or contradicted
*[_type=="statement" && verdict in ["superseded","incorrect"]]{
  quote, verdict, verdictNote, "said by": source->title}
```

![sanity.io/manage: project Open Call, ID dmar00cc](https://raw.githubusercontent.com/gracelee087/open-call/main/docs/screenshots/12-sanity-project.png)

### What this does not do

- **Five events.** Enough to show the modelling and to find real disagreements, not enough
  to plan a year around. Every listing site above showed five or fewer, which is rather the
  point — but it is still five.
- **No times, only dates.** The hour and the timezone are not modelled.
- **English sources only.**
- **The knowledge base does not catch numeric disagreement.** Across two builds in two
  unrelated domains it raised conflicts over wording and never over two sources giving
  different figures for the same thing. The `statement` layer exists partly to cover that.

## Agent Session

<!-- TODO: optional. Upload the Claude Code transcript with the Agent Sessions uploader,
     then press "Make Public" — uploads are unlisted by default and judges cannot open
     them otherwise. Check the transcript for API keys before publishing. -->

---

Built with Claude Code. The demo video is a screen recording of the app, edited with
[HyperFrames](https://hyperframes.heygen.com) together with the screenshots above. Not investment advice, and not a substitute for reading the
organiser's page before you book a flight. That is rather the point.

#sanitychallenge
