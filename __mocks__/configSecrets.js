// Synthetic endpoints for unit tests; never load a developer's local credentials.
const appJson = require('../app.json');

module.exports = {
  encounterApi: {
    serverUrl: 'https://encounter.example.test/',
    version: 'v1/',
    encounter: { create: 'encounter', poll: 'encounters/poll', list: 'encounters' },
    qr: 'qr_code',
    support: { create: 'support/create' },
    user: 'user'
  },
  staticRestSuffix: {
    wasteCalendarExport: '/waste_calendar/export?',
    wasteReminderRegister: '/notification/wastes.json',
    wasteReminderDelete: '/notification/wastes/'
  },
  secrets: {
    [appJson.expo.slug]: {
      serverUrl: 'https://example.test/',
      graphqlEndpoint: 'graphql',
      rest: {},
      volunteer: { serverUrl: 'https://volunteer.example.test/', v1: 'v1/', v2: 'v2/' },
      consul: { serverUrl: 'https://consul.example.test/', graphqlEndpoint: 'graphql' }
    }
  }
};
