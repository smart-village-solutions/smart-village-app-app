import gql from 'graphql-tag';

import { organizationPreviewEntries, personPreviewEntries } from './fragments';

export const membershipQuery = [
  gql`
    query membership($id: String!) {
      oParlMemberships(externalIds: [$id]) {
        endDate
        onBehalfOf {
          ${organizationPreviewEntries}
        }
        organization {
          ${organizationPreviewEntries}
        }
        person {
          ${personPreviewEntries}
        }
        role
        startDate
        votingRight
        id
        externalId
        type
        created
        modified
        license
        keyword
        web
        deleted
      }
    }
  `,
  'oParlMemberships'
] as const;
