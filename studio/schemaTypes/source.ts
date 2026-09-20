import {defineType, defineField} from 'sanity'
import {LinkIcon} from '@sanity/icons/Link'

/**
 * One document we read. Not one website — one page.
 *
 * `kind` is ordered most to least authoritative, and it describes *who published it*
 * rather than what the page looks like: an organiser's blog post is still official,
 * and today it was the only page on baselhack.ch carrying the dates.
 */
export const source = defineType({
  name: 'source',
  title: 'Source',
  type: 'document',
  icon: LinkIcon,
  fields: [
    defineField({
      name: 'url',
      type: 'url',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({name: 'publisher', type: 'string'}),
    defineField({
      name: 'kind',
      title: 'Who published it',
      type: 'string',
      options: {
        list: [
          {title: 'Official — rules or terms document', value: 'official-rules'},
          {title: "Official — the organiser's own site", value: 'official'},
          {title: 'Official — the registration or application platform', value: 'platform'},
          {title: 'Aggregator — listing site or events calendar', value: 'aggregator'},
          {title: 'Third party — blog, wiki, news, social', value: 'third-party'},
        ],
        layout: 'radio',
      },
      description: 'Listed most authoritative first. Nothing computes a score from this — it is recorded, not ranked.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'publishedOn',
      title: 'Published or last updated on',
      type: 'date',
      description: 'As stated by the page itself. Leave empty if the page does not say.',
    }),
    defineField({
      name: 'readOn',
      title: 'Read on',
      type: 'date',
      description: 'When we fetched it. Event pages change; when we looked is part of the fact.',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'aboutEdition',
      title: 'Which edition this source is talking about',
      type: 'number',
      description:
        'The year of the event this page describes — not the year the page was written. ' +
        'Wikipedia was edited in June 2026 and still describes Junction 2025.',
    }),
  ],
  preview: {
    select: {title: 'title', kind: 'kind', publisher: 'publisher', edition: 'aboutEdition'},
    prepare: ({title, kind, publisher, edition}) => ({
      title,
      subtitle: [kind, publisher, edition ? `about ${edition}` : null].filter(Boolean).join(' · '),
    }),
  },
})
