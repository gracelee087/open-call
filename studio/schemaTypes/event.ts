import {isUnique} from './isUnique'
import {defineType, defineField, defineArrayMember} from 'sanity'
import {CalendarIcon} from '@sanity/icons/Calendar'
import type {SourcedClaimValue} from './sourcedClaim'

/** What we collect, decided 2026-09-20. The schema enforces it rather than a README. */
export const EARLIEST_START = '2026-10-01'

const claim = (name: string, title: string, description: string) =>
  defineField({name, title, description, type: 'sourcedClaim', group: 'claims'})

/**
 * One edition of one event. Junction 2026 and Junction 2025 are two documents,
 * because their dates, prizes and sponsors are different and the old one does not
 * stop being findable once the new one exists.
 */
export const event = defineType({
  name: 'event',
  title: 'Event',
  type: 'document',
  icon: CalendarIcon,
  groups: [
    {name: 'identity', title: 'What and where', default: true},
    {name: 'claims', title: 'Things sources disagree about'},
  ],
  fields: [
    defineField({
      name: 'name',
      description: 'Including the year, as the organiser writes it: "Junction 2026".',
      type: 'string',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'series',
      description: 'The recurring event this edition belongs to: "Junction".',
      type: 'string',
      group: 'identity',
    }),
    defineField({
      name: 'year',
      type: 'number',
      group: 'identity',
      validation: (rule) => rule.required().min(2026),
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      options: {
        source: 'name',
        maxLength: 96,
        isUnique: (value, context) => isUnique('slug.current', value, context),
      },
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'officialUrl',
      type: 'url',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'type',
      type: 'string',
      options: {
        list: [
          {title: 'Hackathon', value: 'hackathon'},
          {title: 'Competition', value: 'competition'},
          {title: 'Challenge', value: 'challenge'},
          {title: 'Game jam', value: 'gamejam'},
        ],
      },
      initialValue: 'hackathon',
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'organizer', type: 'string', group: 'identity'}),
    defineField({
      name: 'sponsors',
      description: 'As listed by the event itself. Empty is fine — we do not judge who counts as notable.',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      group: 'identity',
    }),
    defineField({
      name: 'format',
      description: 'Online-only events are out of scope.',
      type: 'string',
      options: {
        list: [
          {title: 'On site', value: 'onsite'},
          {title: 'Hybrid', value: 'hybrid'},
        ],
        layout: 'radio',
      },
      group: 'identity',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'venues',
      description: 'More than one when an edition runs in several cities at once — CASSINI runs in ten.',
      type: 'array',
      group: 'identity',
      of: [
        defineArrayMember({
          type: 'object',
          fields: [
            defineField({name: 'city', type: 'string', validation: (r) => r.required()}),
            defineField({name: 'country', type: 'string', validation: (r) => r.required()}),
          ],
          preview: {
            select: {title: 'city', subtitle: 'country'},
          },
        }),
      ],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'eventStart',
      type: 'date',
      group: 'identity',
      validation: (rule) =>
        rule
          .required()
          .min(EARLIEST_START)
          .error(`We only collect editions starting on or after ${EARLIEST_START}.`),
    }),
    defineField({name: 'eventEnd', type: 'date', group: 'identity'}),
    defineField({
      name: 'applyBy',
      title: 'Application deadline',
      description:
        'The one that closes entry. Other deadlines — travel grants, early bird — belong in ' +
        'the note on the claim they affect, not here.',
      type: 'date',
      group: 'identity',
    }),
    defineField({
      name: 'registrationStatus',
      type: 'string',
      options: {
        list: [
          {title: 'Announced, not open yet', value: 'announced'},
          {title: 'Applications open', value: 'applications-open'},
          {title: 'Applications closed', value: 'applications-closed'},
        ],
      },
      group: 'identity',
    }),
    defineField({name: 'maxTeamSize', type: 'number', group: 'identity'}),
    defineField({
      name: 'tags',
      type: 'array',
      of: [defineArrayMember({type: 'string'})],
      options: {layout: 'tags'},
      group: 'identity',
    }),

    claim('free', 'Free to enter', 'Is there anything to pay? Deposits, limited places and "you have to be accepted" go in the note.'),
    claim('studentsOnly', 'Students only', 'Is entry restricted to students? Several large European hackathons are, and listings rarely say so.'),
    claim('travelCovered', 'Travel costs covered', 'Does the organiser pay any of it? Caps, shortlists and separate deadlines go in the note.'),
    claim('accommodation', 'Accommodation provided', 'Does the organiser give you somewhere to sleep? A discount code for a partner hotel is not the same thing.'),
    claim('prizeIsCash', 'Prize is cash', 'Is the headline figure actually money? It is often credits, hardware, or the whole event budget.'),

    defineField({
      name: 'prizeAmount',
      type: 'number',
      group: 'claims',
      description: 'Only if the event states a prize figure. Sponsorship totals are not prize money.',
    }),
    defineField({name: 'prizeCurrency', type: 'string', group: 'claims'}),
  ],

  validation: (rule) =>
    rule.custom((doc: Record<string, unknown> | undefined) => {
      if (typeof doc?.prizeAmount !== 'number') return true
      const isCash = doc.prizeIsCash as SourcedClaimValue | undefined
      if (!isCash?.basis) {
        return 'A prize figure needs a source. Fill in "Prize is cash" and say where the figure was read.'
      }
      return true
    }),

  preview: {
    select: {name: 'name', start: 'eventStart', city: 'venues.0.city', country: 'venues.0.country'},
    prepare: ({name, start, city, country}) => ({
      title: name,
      subtitle: [start, [city, country].filter(Boolean).join(', ')].filter(Boolean).join(' · '),
    }),
  },
})
