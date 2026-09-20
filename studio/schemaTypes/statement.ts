import {defineType, defineField} from 'sanity'
import {BlockquoteIcon} from '@sanity/icons/Blockquote'

export const STATEMENT_FIELDS = [
  {title: 'Application deadline', value: 'applyBy'},
  {title: 'Event dates', value: 'dates'},
  {title: 'Venue', value: 'venue'},
  {title: 'Free to enter', value: 'free'},
  {title: 'Prize', value: 'prize'},
  {title: 'Travel costs', value: 'travel'},
  {title: 'Accommodation', value: 'accommodation'},
  {title: 'Who can enter', value: 'eligibility'},
  {title: 'How you get in', value: 'entry'},
  {title: 'Sponsors', value: 'sponsors'},
  {title: 'Whether it is still open', value: 'status'},
]

/**
 * One thing one source said about one aspect of one event, quoted.
 *
 * Statements come first and event fields are filled from them, never the other way
 * round. When two statements about the same field disagree — or one of them has
 * quietly gone out of date — that is the product, not a data-quality problem.
 */
export const statement = defineType({
  name: 'statement',
  title: 'Statement',
  type: 'document',
  icon: BlockquoteIcon,
  fields: [
    defineField({
      name: 'event',
      type: 'reference',
      to: [{type: 'event'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'field',
      title: 'What it is about',
      type: 'string',
      options: {list: STATEMENT_FIELDS},
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'quote',
      title: 'Quoted verbatim',
      description: 'The source\'s own words. Do not paraphrase, tidy up, or convert units here.',
      type: 'text',
      rows: 3,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'source',
      type: 'reference',
      to: [{type: 'source'}],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verdict',
      title: 'Where this stands',
      type: 'string',
      options: {
        list: [
          {title: 'Not looked at yet', value: 'unresolved'},
          {title: 'This is the one that holds', value: 'accepted'},
          {title: 'Out of date — a later source replaced it', value: 'superseded'},
          {title: 'Wrong', value: 'incorrect'},
        ],
        layout: 'radio',
      },
      initialValue: 'unresolved',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'verdictNote',
      title: 'Why',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'kbIssueUrl',
      title: 'Knowledge Base issue',
      description: 'If Context raised this as an issue during a build, link it here.',
      type: 'url',
    }),
  ],
  preview: {
    select: {
      quote: 'quote',
      field: 'field',
      verdict: 'verdict',
      event: 'event.name',
      source: 'source.title',
    },
    prepare: ({quote, field, verdict, event, source}) => ({
      title: quote,
      subtitle: [event, field, source, verdict !== 'unresolved' ? verdict : null]
        .filter(Boolean)
        .join(' · '),
    }),
  },
})
