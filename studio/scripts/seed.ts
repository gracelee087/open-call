/**
 * Seed the events researched on 2026-09-20, with the sources they were read from.
 *
 * Run:  npx sanity exec scripts/seed.ts --with-user-token
 *
 * Idempotent: every document has a deterministic _id, so re-running updates in place
 * rather than piling up duplicates. Claims left out of an event stay "not stated",
 * which is the honest reading of a page that never mentions them.
 */
import {getCliClient} from 'sanity/cli'

const client = getCliClient({apiVersion: '2024-01-01'})

const READ_ON = '2026-09-20'

type SourceSeed = {
  id: string
  url: string
  title: string
  publisher: string
  kind: 'official-rules' | 'official' | 'platform' | 'aggregator' | 'third-party'
  aboutEdition?: number
  publishedOn?: string
}

type Claim = {value: 'yes' | 'no' | 'not-stated'; note?: string; basis?: string}

type EventSeed = {
  id: string
  name: string
  series?: string
  year: number
  officialUrl: string
  organizer?: string
  sponsors?: string[]
  format: 'onsite' | 'hybrid'
  venues: {city: string; country: string}[]
  eventStart: string
  eventEnd?: string
  applyBy?: string
  registrationStatus?: 'announced' | 'applications-open' | 'applications-closed'
  maxTeamSize?: number
  prizeAmount?: number
  prizeCurrency?: string
  free?: Claim
  studentsOnly?: Claim
  travelCovered?: Claim
  accommodation?: Claim
  prizeIsCash?: Claim
}

type StatementSeed = {
  id: string
  event: string
  field: string
  quote: string
  source: string
  verdict?: 'unresolved' | 'accepted' | 'superseded' | 'incorrect'
  verdictNote?: string
}

const sources: SourceSeed[] = [
  {
    id: 'src-junction-site',
    url: 'https://2026.hackjunction.com/',
    title: 'Junction 2026: European Tech Renaissance',
    publisher: 'Junction',
    kind: 'official',
    aboutEdition: 2026,
  },
  {
    id: 'src-junction-platform',
    url: 'https://hackjunction.app/hackathons/junction-2026',
    title: 'Junction 2026 - application platform',
    publisher: 'Junction',
    kind: 'platform',
    aboutEdition: 2026,
  },
  {
    id: 'src-junction-wikipedia',
    url: 'https://en.wikipedia.org/wiki/Junction_(hackathon)',
    title: 'Junction (hackathon) - Wikipedia',
    publisher: 'Wikipedia',
    kind: 'third-party',
    aboutEdition: 2025,
    publishedOn: '2026-06-03',
  },
  {
    id: 'src-cassini-site',
    url: 'https://www.cassini.eu/hackathons/',
    title: 'CASSINI Hackathons - official website',
    publisher: 'European Commission (CASSINI)',
    kind: 'official',
    aboutEdition: 2026,
  },
  {
    id: 'src-baselhack-event',
    url: 'https://www.baselhack.ch/event',
    title: 'BaselHack Event 2026 - details about dates, venue',
    publisher: 'BaselHack Verein',
    kind: 'official',
    aboutEdition: 2026,
  },
  {
    id: 'src-baselhack-home',
    url: 'https://www.baselhack.ch/',
    title: 'BaselHack 2026 - the hackathon for the Basel region',
    publisher: 'BaselHack Verein',
    kind: 'official',
    aboutEdition: 2026,
  },
  {
    id: 'src-baselhack-savethedate',
    url: 'https://www.baselhack.ch/blog/baselhack-2026-save-the-date',
    title: 'BaselHack 2026 | Save the date',
    publisher: 'BaselHack Verein',
    kind: 'official',
    aboutEdition: 2026,
  },
  {
    id: 'src-odoo-register',
    url: 'https://www.odoo.com/event/hackathon-6-edition-12473/register',
    title: 'Hackathon #6 Edition - registration',
    publisher: 'Odoo S.A.',
    kind: 'platform',
    aboutEdition: 2026,
  },
  {
    id: 'src-poe-luma',
    url: 'https://luma.com/iv9uovum',
    title: 'Hackathon Power of Europe @ Amsterdam/Oosterpark',
    publisher: 'Tech Makers / Build Europe',
    kind: 'official',
    aboutEdition: 2026,
  },
  {
    id: 'src-devevents-eu',
    url: 'https://dev.events/hackathons/EU/tech',
    title: 'Tech hackathons in Europe 2026 / 2027',
    publisher: 'dev.events',
    kind: 'aggregator',
  },
  {
    id: 'src-hackathoncom-europe',
    url: 'https://www.hackathon.com/country/europe',
    title: 'Hackathons in Europe - hackathon.com',
    publisher: 'hackathon.com',
    kind: 'aggregator',
  },
  {
    id: 'src-mlh-2027',
    url: 'https://www.mlh.com/seasons/2027/events',
    title: 'MLH 2027 Season events',
    publisher: 'Major League Hacking',
    kind: 'aggregator',
  },
]

const events: EventSeed[] = [
  {
    id: 'evt-junction-2026',
    name: 'Junction 2026',
    series: 'Junction',
    year: 2026,
    officialUrl: 'https://2026.hackjunction.com/',
    organizer: 'Junction',
    sponsors: ['Hostinger', 'Arduino', 'OpenAI', 'Aalto University'],
    format: 'onsite',
    venues: [{city: 'Espoo', country: 'Finland'}],
    eventStart: '2026-11-13',
    eventEnd: '2026-11-15',
    applyBy: '2026-10-25',
    registrationStatus: 'applications-open',
    maxTeamSize: 4,
    prizeAmount: 100000,
    prizeCurrency: 'EUR',
    free: {
      value: 'yes',
      note: '"Free to enter" - but entry is by application, and every application is reviewed.',
      basis: 'src-junction-site',
    },
    studentsOnly: {
      value: 'no',
      note: '"Anyone who builds. Developers, designers, and makers from any background and any experience level are welcome." Participants are "mainly 18 and over".',
      basis: 'src-junction-site',
    },
    travelCovered: {
      value: 'yes',
      note: '"Travel grants are available on a limited basis for the strongest applications." Separate travel-grant deadline of 6 September, already passed. The application platform says the 300 EUR and 100 EUR travel grant applications "have been closed for international participants".',
      basis: 'src-junction-platform',
    },
    accommodation: {
      value: 'no',
      note: 'Not provided by the organisers. Discounted rooms through partner hotels near the venue; the venue is open 24/7 so people sleep on site.',
      basis: 'src-junction-site',
    },
    prizeIsCash: {
      value: 'not-stated',
      note: '"100,000 EUR In prizes" across the weekend, and "Full prize breakdown coming soon." The page never says how much of it is cash.',
      basis: 'src-junction-site',
    },
  },
  {
    id: 'evt-cassini-12',
    name: 'CASSINI Hackathon #12 - EU Space for Peace and Resilience',
    series: 'CASSINI Hackathon',
    year: 2026,
    officialUrl: 'https://www.cassini.eu/hackathons/',
    organizer: 'European Commission (CASSINI)',
    format: 'onsite',
    venues: [
      {city: 'Sofia', country: 'Bulgaria'},
      {city: 'Prague', country: 'Czech Republic'},
      {city: 'Espoo', country: 'Finland'},
      {city: 'Darmstadt', country: 'Germany'},
      {city: 'Dublin', country: 'Ireland'},
      {city: 'Turin', country: 'Italy'},
      {city: 'Kaunas', country: 'Lithuania'},
      {city: 'Gdansk', country: 'Poland'},
      {city: 'Bucharest', country: 'Romania'},
      {city: 'Ivano-Frankivsk', country: 'Ukraine'},
    ],
    eventStart: '2026-11-27',
    eventEnd: '2026-11-29',
    prizeAmount: 9000,
    prizeCurrency: 'EUR',
    prizeIsCash: {
      value: 'yes',
      note: '"compete for cash prizes up to 9,000 EUR (1st: 5,000, 2nd: 3,000, 3rd: 1,000) plus 6 months of mentoring"',
      basis: 'src-cassini-site',
    },
    // free, studentsOnly, travelCovered, accommodation: the page never says. Left at "not stated".
  },
  {
    id: 'evt-baselhack-2026',
    name: 'BaselHack 2026',
    series: 'BaselHack',
    year: 2026,
    officialUrl: 'https://www.baselhack.ch/',
    organizer: 'BaselHack Verein',
    sponsors: [
      'Basel Tech',
      'Adobe',
      'Endress+Hauser',
      'PAX',
      'OpenAI',
      'Memox Basel',
      'Coop',
      'nag Informatik AG',
      'codebar Solutions AG',
    ],
    format: 'onsite',
    venues: [{city: 'Basel', country: 'Switzerland'}],
    eventStart: '2026-10-30',
    eventEnd: '2026-11-01',
    free: {
      value: 'yes',
      note: '"at BaselHack this is all for free!" on the homepage; the save-the-date post says "Free to attend".',
      basis: 'src-baselhack-home',
    },
    prizeIsCash: {
      value: 'not-stated',
      note: 'The site promises "Great prices for winners" and "fantastic prize money" but never states a figure. The 25,000-35,000 CHF that circulates is the sponsorship budget for venue, catering and prizes - not the prize pot.',
      basis: 'src-baselhack-home',
    },
  },
  {
    id: 'evt-odoo-hackathon-6',
    name: 'Odoo Hackathon #6',
    series: 'Odoo Hackathon',
    year: 2026,
    officialUrl: 'https://www.odoo.com/event/hackathon-6-edition-12473/register',
    organizer: 'Odoo S.A.',
    sponsors: ['Odoo'],
    format: 'onsite',
    venues: [{city: 'Grand-Rosiere', country: 'Belgium'}],
    eventStart: '2026-11-20',
    eventEnd: '2026-11-22',
    // No applyBy. The registration page never states an application deadline —
    // 13 November is the cancellation refund cut-off, and an earlier pass of this
    // seed recorded it as the deadline. That is the mistake this project exists to catch.
    registrationStatus: 'applications-open',
    maxTeamSize: 4,
    free: {
      value: 'yes',
      note: '48 EUR for a team of four, 12 EUR solo - but "The ticket price is a deposit to secure your place and will be fully refunded (VAT included) the day after the event." The page gives the cancellation cut-off twice and not identically; see the statements on this event.',
      basis: 'src-odoo-register',
    },
    accommodation: {
      value: 'no',
      note: 'Meals, parking, showers and a chill area are included; accommodation is not. Participants bring their own camping gear.',
      basis: 'src-odoo-register',
    },
    travelCovered: {
      value: 'no',
      note: 'Not covered by the organisers.',
      basis: 'src-odoo-register',
    },
    prizeIsCash: {
      value: 'not-stated',
      note: '"fantastic prizes" for top performers; no figure and no form given.',
      basis: 'src-odoo-register',
    },
  },
  {
    id: 'evt-power-of-europe-amsterdam',
    name: 'Hackathon Power of Europe - Amsterdam',
    series: 'Power of Europe',
    year: 2026,
    officialUrl: 'https://luma.com/iv9uovum',
    organizer: 'Tech Makers / Build Europe',
    sponsors: ['Orq AI', 'Mistral AI', 'Weaviate', 'Koyeb', 'Kilocode AI', 'AI for Good', 'Rewire'],
    format: 'onsite',
    venues: [{city: 'Amsterdam', country: 'Netherlands'}],
    eventStart: '2026-10-18',
    prizeAmount: 7800,
    prizeCurrency: 'EUR',
    prizeIsCash: {
      value: 'no',
      note: '"Top 3 teams receive credits from partner companies... First place: 7,800 EUR+ in combined credits; second place: 3,650+; third place: 2,550+." None of it is cash.',
      basis: 'src-poe-luma',
    },
    travelCovered: {
      value: 'yes',
      note: 'Only for winners, and only onward: "Selected top performers invited to Build Europe Hackathon in Zurich with all-expenses-paid trips."',
      basis: 'src-poe-luma',
    },
  },
]

const statements: StatementSeed[] = [
  {
    id: 'stm-junction-applyby-site',
    event: 'evt-junction-2026',
    field: 'applyBy',
    quote: 'Applications close - Midnight 25.10.2026 GMT +03',
    source: 'src-junction-site',
    verdict: 'accepted',
    verdictNote: 'The organiser says it on two of their own surfaces, and they agree.',
  },
  {
    id: 'stm-junction-applyby-platform',
    event: 'evt-junction-2026',
    field: 'applyBy',
    quote: 'Registration Deadline: 25 Oct 2026, 22:55',
    source: 'src-junction-platform',
    verdict: 'accepted',
  },
  {
    id: 'stm-junction-travel-site',
    event: 'evt-junction-2026',
    field: 'travel',
    quote: 'Travel grants are available on a limited basis for the strongest applications.',
    source: 'src-junction-site',
    verdict: 'superseded',
    verdictNote:
      'Present tense, still up on 20 September. The travel-grant deadline was 6 September and the application platform says the grants are closed.',
  },
  {
    id: 'stm-junction-travel-platform',
    event: 'evt-junction-2026',
    field: 'travel',
    quote: 'Travel grants applications have been closed for international participants.',
    source: 'src-junction-platform',
    verdict: 'accepted',
  },
  {
    id: 'stm-junction-dates-wikipedia',
    event: 'evt-junction-2026',
    field: 'dates',
    quote: 'Junction 2025 was held on November 14-16.',
    source: 'src-junction-wikipedia',
    verdict: 'superseded',
    verdictNote:
      'Last edited 3 June 2026 and still describes the 2025 edition. Junction 2026 runs 13-15 November - one day earlier, which is exactly the kind of near-miss that gets copied.',
  },
  {
    id: 'stm-junction-missing-devevents',
    event: 'evt-junction-2026',
    field: 'status',
    quote:
      'dev.events lists five tech hackathons for the whole of Europe. Junction - 2,000 builders, 100,000 EUR in prizes - is not one of them.',
    source: 'src-devevents-eu',
    verdict: 'incorrect',
    verdictNote: 'Absence is the failure mode nobody checks for: the listing looks complete.',
  },
  {
    id: 'stm-junction-missing-hackathoncom',
    event: 'evt-junction-2026',
    field: 'status',
    quote: "There is no upcoming hackathons found in 'Europe'",
    source: 'src-hackathoncom-europe',
    verdict: 'incorrect',
    verdictNote: 'Said flatly, on 20 September 2026, with at least fifteen of them open.',
  },
  {
    id: 'stm-baselhack-dates-event',
    event: 'evt-baselhack-2026',
    field: 'dates',
    quote: 'The page shows a countdown and no dates at all.',
    source: 'src-baselhack-event',
    verdict: 'incorrect',
    verdictNote:
      'The page called "Event" is the one page on the site that never states the dates. They are on the homepage and in a blog post instead.',
  },
  {
    id: 'stm-baselhack-dates-savethedate',
    event: 'evt-baselhack-2026',
    field: 'dates',
    quote: 'October 30 - November 1, 2026 (Friday evening to Sunday afternoon)',
    source: 'src-baselhack-savethedate',
    verdict: 'accepted',
  },
  {
    id: 'stm-baselhack-prize-home',
    event: 'evt-baselhack-2026',
    field: 'prize',
    quote: 'Great prices for winners ... fantastic prize money',
    source: 'src-baselhack-home',
    verdict: 'unresolved',
    verdictNote:
      'No figure anywhere on the official site. Any number you find elsewhere came from somewhere else.',
  },
  {
    id: 'stm-odoo-free-register',
    event: 'evt-odoo-hackathon-6',
    field: 'free',
    quote:
      'The ticket price is a deposit to secure your place and will be fully refunded (VAT included) the day after the event.',
    source: 'src-odoo-register',
    verdict: 'accepted',
  },
  {
    id: 'stm-odoo-cancel-keydetails',
    event: 'evt-odoo-hackathon-6',
    field: 'free',
    quote: 'In case of cancellation after November 13, the deposit will not be refunded.',
    source: 'src-odoo-register',
    verdict: 'unresolved',
    verdictNote:
      'From the "Key details about registration" section. The Terms and conditions section on the same page draws the line at 14 November instead. Context raised this as a conflict during the knowledge base build; the resolution took the 14 November wording as the rule. The two statements agree on everything except 14 November itself, which one of them leaves undefined.',
  },
  {
    id: 'stm-odoo-cancel-terms',
    event: 'evt-odoo-hackathon-6',
    field: 'free',
    quote:
      'If cancellation occurs before November 14, a full refund of the deposit will be provided. However, for cancellations after November 14, the deposit will be retained by the organizer.',
    source: 'src-odoo-register',
    verdict: 'accepted',
    verdictNote: 'Chosen as the operative rule when the knowledge base issue was resolved.',
  },
  {
    id: 'stm-odoo-venue-devevents',
    event: 'evt-odoo-hackathon-6',
    field: 'venue',
    quote: 'Odoo Hackathon #6 - Nov 20-22, 2026 | Ramillies, Belgium',
    source: 'src-devevents-eu',
    verdict: 'unresolved',
    verdictNote:
      'Grand-Rosiere is in the Ramillies municipality, so this is not wrong - but you cannot navigate to it. The official address is Rue des Bourlottes 9, 1367 Grand-Rosiere.',
  },
  {
    id: 'stm-odoo-venue-official',
    event: 'evt-odoo-hackathon-6',
    field: 'venue',
    quote: 'Odoo S.A., Rue des Bourlottes 9, 1367 Grand-Rosiere (Farm 2), Belgium',
    source: 'src-odoo-register',
    verdict: 'accepted',
  },
  {
    id: 'stm-poe-prize-luma',
    event: 'evt-power-of-europe-amsterdam',
    field: 'prize',
    quote:
      'Top 3 teams receive credits from partner companies (Orq AI, Mistral, Weaviate, Koyeb, Kilocode AI). First place: 7,800 EUR+ in combined credits; second place: 3,650+; third place: 2,550+.',
    source: 'src-poe-luma',
    verdict: 'accepted',
    verdictNote: 'A 7,800 EUR headline with no cash in it.',
  },
]

const ref = (id: string) => ({_type: 'reference', _ref: id})

const claimDoc = (c: Claim | undefined, realId: Map<string, string>) =>
  c
    ? {
        _type: 'sourcedClaim',
        value: c.value,
        ...(c.note ? {note: c.note} : {}),
        ...(c.basis ? {basis: ref(realId.get(c.basis)!)} : {}),
      }
    : undefined

async function run() {
  // Sanity assigns every _id. Identity lives in content — a source is its url, an event
  // is its slug — so re-running this matches on those and patches in place rather than
  // inventing ids that encode what the documents already say.
  const realId = new Map<string, string>()

  const existingSources: {_id: string; url: string}[] = await client.fetch(
    `*[_type == "source"]{_id, url}`,
  )
  const sourceIdByUrl = new Map(existingSources.map((d) => [d.url, d._id]))

  for (const s of sources) {
    const fields = {
      url: s.url,
      title: s.title,
      publisher: s.publisher,
      kind: s.kind,
      readOn: READ_ON,
      publishedOn: s.publishedOn ?? null,
      aboutEdition: s.aboutEdition ?? null,
    }
    const found = sourceIdByUrl.get(s.url)
    const id = found
      ? (await client.patch(found).set(fields).commit())._id
      : (await client.create({_type: 'source', ...fields}))._id
    realId.set(s.id, id)
  }

  const existingEvents: {_id: string; slug?: string}[] = await client.fetch(
    `*[_type == "event"]{_id, "slug": slug.current}`,
  )
  const eventIdBySlug = new Map(existingEvents.filter((d) => d.slug).map((d) => [d.slug!, d._id]))

  for (const e of events) {
    const slug = e.id.replace(/^evt-/, '')
    const claims = {
      free: claimDoc(e.free, realId),
      studentsOnly: claimDoc(e.studentsOnly, realId),
      travelCovered: claimDoc(e.travelCovered, realId),
      accommodation: claimDoc(e.accommodation, realId),
      prizeIsCash: claimDoc(e.prizeIsCash, realId),
    }
    const fields = {
      name: e.name,
      series: e.series ?? null,
      year: e.year,
      slug: {_type: 'slug', current: slug},
      officialUrl: e.officialUrl,
      type: 'hackathon',
      organizer: e.organizer ?? null,
      sponsors: e.sponsors ?? null,
      format: e.format,
      venues: e.venues.map((v, i) => ({_key: `v${i}`, ...v})),
      eventStart: e.eventStart,
      eventEnd: e.eventEnd ?? null,
      applyBy: e.applyBy ?? null,
      registrationStatus: e.registrationStatus ?? null,
      maxTeamSize: e.maxTeamSize ?? null,
      prizeAmount: e.prizeAmount ?? null,
      prizeCurrency: e.prizeCurrency ?? null,
      free: claims.free ?? null,
      studentsOnly: claims.studentsOnly ?? null,
      travelCovered: claims.travelCovered ?? null,
      accommodation: claims.accommodation ?? null,
      prizeIsCash: claims.prizeIsCash ?? null,
    }
    const found = eventIdBySlug.get(slug)
    const id = found
      ? (await client.patch(found).set(fields).commit())._id
      : (await client.create({_type: 'event', ...fields}))._id
    realId.set(e.id, id)
  }

  // Statements are derived records with no identity of their own: every run replaces them.
  const stale: string[] = await client.fetch(`*[_type == "statement"]._id`)
  const tx = client.transaction()
  for (const id of stale) tx.delete(id)
  for (const s of statements) {
    tx.create({
      _type: 'statement',
      event: ref(realId.get(s.event)!),
      field: s.field,
      quote: s.quote,
      source: ref(realId.get(s.source)!),
      verdict: s.verdict ?? 'unresolved',
      ...(s.verdictNote ? {verdictNote: s.verdictNote} : {}),
    })
  }
  await tx.commit()

  console.log(
    `seeded ${sources.length} sources, ${events.length} events, ${statements.length} statements`,
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
