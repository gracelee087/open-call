import {defineType, defineField} from 'sanity'

/**
 * A yes/no fact that always says where it came from.
 *
 * Every field on an event that sources disagree about — or stay silent about —
 * is one of these. The third value is the point: a page that never mentions
 * travel grants is not a page that says there are none.
 */
export interface SourcedClaimValue {
  value?: 'yes' | 'no' | 'not-stated'
  note?: string
  basis?: {_ref: string}
}

export const sourcedClaim = defineType({
  name: 'sourcedClaim',
  title: 'Sourced claim',
  type: 'object',
  fields: [
    defineField({
      name: 'value',
      title: 'What the source says',
      type: 'string',
      options: {
        list: [
          {title: 'Yes', value: 'yes'},
          {title: 'No', value: 'no'},
          {title: 'Not stated in the source', value: 'not-stated'},
        ],
        layout: 'radio',
      },
      initialValue: 'not-stated',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'note',
      title: "The qualifier, in the source's own words",
      description: 'Quote it rather than summarising it. Leave empty if there is no qualifier.',
      type: 'text',
      rows: 2,
    }),
    defineField({
      name: 'basis',
      title: 'Where this was read',
      type: 'reference',
      to: [{type: 'source'}],
    }),
  ],
  validation: (rule) =>
    rule.custom((claim: SourcedClaimValue | undefined) => {
      if (!claim?.value) return true
      if (claim.value !== 'not-stated' && !claim.basis) {
        return 'A stated value needs a source. Either set it to "Not stated in the source", or say where you read it.'
      }
      return true
    }),
})
