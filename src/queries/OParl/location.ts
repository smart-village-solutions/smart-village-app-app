import gql from 'graphql-tag';

import {
  bodyPreviewEntries,
  meetingPreviewEntries,
  organizationPreviewEntries,
  paperPreviewEntries,
  personPreviewEntries
} from './fragments';

export const locationQuery = [
  gql`
    query location($id: String!) {
      oParlLocations(externalIds: [$id]) {
        bodies {
          ${bodyPreviewEntries}
        }
        description
        geojson
        locality
        meeting {
          ${meetingPreviewEntries}
        }
        organization {
          ${organizationPreviewEntries}
        }
        papers {
          ${paperPreviewEntries}
        }
        persons {
          ${personPreviewEntries}
        }
        postalCode
        room
        streetAddress
        subLocality
        id: externalId
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
  'oParlLocations'
] as const;
