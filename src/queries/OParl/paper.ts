import gql from 'graphql-tag';
import {
  bodyPreviewEntries,
  consultationPreviewEntries,
  filePreviewEntries,
  locationPreviewEntries,
  organizationPreviewEntries,
  paperPreviewEntries,
  personPreviewEntries
} from './fragments';

export const paperQuery = [
  gql`
    query papers($ids: [String!]) {
      oParlPapers(externalIds: $ids) {
        id: externalId
        type
        deleted
        name
        reference
        auxiliaryFile {
          ${filePreviewEntries}
        }
        body {
          ${bodyPreviewEntries}
        }
        consultation {
          ${consultationPreviewEntries}
        }
        created
        date
        keyword
        license
        location {
          ${locationPreviewEntries}
        }
        mainFile {
          ${filePreviewEntries}
        }
        modified
        originatorOrganization {
          ${organizationPreviewEntries}
        }
        originatorPerson {
          ${personPreviewEntries}
        }
        paperType
        relatedPaper {
          ${paperPreviewEntries}
        }
        subordinatedPaper {
          ${paperPreviewEntries}
        }
        superordinatedPaper {
          ${paperPreviewEntries}
        }
        underDirectionOf {
          ${organizationPreviewEntries}
        }
        web
      }
    }
  `,
  'oParlPapers'
] as const;
