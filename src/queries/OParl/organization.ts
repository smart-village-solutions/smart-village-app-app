import gql from 'graphql-tag';

import {
  bodyPreviewEntries,
  consultationPreviewEntries,
  locationPreviewEntries,
  meetingPreviewEntries,
  membershipPreviewEntries,
  organizationPreviewEntries
} from './fragments';

export const organizationListQuery = [
  gql`
    query organizations {
      oParlOrganizations {
        id: externalId
        name
        shortName
        membership {
          person {
            id: externalId
            type
            affix
            familyName
            formOfAddress
            givenName
            membership {
              organization {
                name
                shortName
              }
            }
          }
        }
      }
    }
  `,
  'oParlOrganizations'
] as const;

export const organizationQuery = [
  gql`
    query organization($id: String!) {
      oParlOrganizations(externalIds: [$id]) {
        id: externalId
        type
        body {
          ${bodyPreviewEntries}
        }
        classification
        endDate
        externalBody
        location {
          ${locationPreviewEntries}
        }
        meeting {
          ${meetingPreviewEntries}
        }
        membership {
          ${membershipPreviewEntries}
        }
        consultation {
          ${consultationPreviewEntries}
        }
        name
        organizationType
        post
        shortName
        startDate
        subOrganizationOf {
          ${organizationPreviewEntries}
        }
        website
        created
        modified
        license
        keyword
        web
        deleted
      }
    }
  `,
  'oParlOrganizations'
] as const;
