// all defined fragments need to be used, so we split them up here into strings and do not use graphql fragments at all

export const agendaItemPreviewEntries = `
  id: externalId
  type
  name
  number
  order
  start
`;

export const bodyPreviewEntries = `
  id: externalId
  type
  deleted
  name
  shortName
`;

export const filePreviewEntries = `
  id: externalId
  type
  accessUrl
  deleted
  fileName
  name
  mimeType
  size
`;

export const legislativeTermPreviewEntries = `
  id: externalId
  type
  created
  modified
  deleted
  keyword
  web
  endDate
  name
  startDate
`;

export const locationPreviewEntries = `
  id: externalId
  type
  deleted
  locality
  postalCode
  room
  streetAddress
  subLocality
`;

export const meetingPreviewEntries = `
  id: externalId
  type
  cancelled
  deleted
  name
  start
`;

export const organizationPreviewEntries = `
  id: externalId
  type
  classification
  deleted
  name
  shortName
`;

export const paperPreviewEntries = `
  id: externalId
  type
  deleted
  name
  reference
`;

// used in person to avoid cycle person <-> membership
const simpleMembershipEntries = `
  id: externalId
  type
  deleted
  onBehalfOf {
    ${organizationPreviewEntries}
  }
  organization {
    ${organizationPreviewEntries}
  }
  endDate
  startDate
`;

export const personPreviewEntries = `
  id: externalId
  type
  affix
  deleted
  familyName
  formOfAddress
  givenName
  membership {
    ${simpleMembershipEntries}
  }
  name
  title
`;

// used in membership to avoid cycle person <-> membership
export const simplePersonEntries = `
  id: externalId
  type
  affix
  deleted
  familyName
  formOfAddress
  givenName
  name
  title
`;

export const membershipPreviewEntries = `
  id: externalId
  type
  deleted
  onBehalfOf {
    ${organizationPreviewEntries}
  }
  organization {
    ${organizationPreviewEntries}
  }
  person {
    ${simplePersonEntries}
  }
  endDate
  startDate
`;

export const consultationPreviewEntries = `
  id: externalId
  type
  agendaItem {
    ${agendaItemPreviewEntries}
  }
  deleted
  meeting {
    ${meetingPreviewEntries}
  }
  paper {
    ${paperPreviewEntries}
  }
`;
