import gql from 'graphql-tag';

import { legislativeTermPreviewEntries, systemPreviewEntries } from './fragments';

export const bodyQuery = [
  gql`
    query body($id: String!) {
      oParlBodies(externalIds: [$id]) {
        id: externalId
        type
        created
        modified
        deleted
        keyword
        web
        name
        shortName
        ags
        classification
        contactEmail
        contactName
        equivalent
        legislativeTerm {
          ${legislativeTermPreviewEntries}
        }
        license
        licenseValidSince
        oparlSince
        rgs
        website
        system {
          ${systemPreviewEntries}
        }
      }
    }
  `,
  'oParlBodies'
] as const;
