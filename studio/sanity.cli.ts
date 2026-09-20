import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'dmar00cc',
    dataset: 'production'
  },
  /** Context MCP only serves datasets that have a deployed Studio. */
  studioHost: 'open-call-eu',
  typegen: {
    enabled: true,
    path: './scripts/**/*.ts',
    schema: 'schema.json',
    generates: '../web/sanity.types.ts',
    overloadClientMethods: true,
  },
  deployment: {
    appId: 'vy0ypy4u5yjkmr4wtt1rwotq',
    /**
     * Enable auto-updates for studios.
     * Learn more at https://www.sanity.io/docs/studio/latest-version-of-sanity#k47faf43faf56
     */
    autoUpdates: true,
  },
})
