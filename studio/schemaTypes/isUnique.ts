import type {ValidationContext} from 'sanity'

/**
 * The seed script finds an existing document by what it says it is - a source is its url,
 * an event is its slug - and patches that document in place. A duplicate is therefore not
 * a tidiness problem: the next seed run would patch whichever of the two it happened to
 * read first. Sanity has no uniqueness constraint, so the check has to be a query.
 *
 * Drafts share their published document's id with a `drafts.` prefix, so both ids are
 * excluded or a document would always collide with its own draft.
 */
export async function isUnique(
  field: string,
  value: string,
  context: ValidationContext,
): Promise<boolean> {
  const {document, getClient} = context
  if (!document) return true

  const id = document._id.replace(/^drafts\./, '')
  const params = {draft: `drafts.${id}`, published: id, value}
  const query = `!defined(*[!(_id in [$draft, $published]) && ${field} == $value][0]._id)`

  return getClient({apiVersion: '2024-01-01'}).fetch(query, params)
}
