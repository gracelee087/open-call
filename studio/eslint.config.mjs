import studio from '@sanity/eslint-config-studio'

export default [
  // sanity.types.ts is written by `npm run typegen`, not by hand.
  {ignores: ['scripts/sanity.types.ts']},
  ...studio,
]
