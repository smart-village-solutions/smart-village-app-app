import gql from 'graphql-tag';
import {
  agendaItemPreviewEntries,
  filePreviewEntries,
  meetingPreviewEntries,
  paperPreviewEntries
} from './fragments';

export const fileQuery = [
  gql`
    query file($id: String!) {
      oParlFiles(externalIds: [$id]) {
        id: externalId
        type
        accessUrl
        agendaItem {
          ${agendaItemPreviewEntries}
        }
        date
        derivativeFile {
          ${filePreviewEntries}
        }
        downloadUrl
        externalServiceUrl
        fileLicense
        fileName
        masterFile {
          ${filePreviewEntries}
        }
        meeting {
          ${meetingPreviewEntries}
        }
        mimeType
        name
        paper {
          ${paperPreviewEntries}
        }
        sha1Checksum
        sha512Checksum
        size
        text
      }
    }
  `,
  'oParlFiles'
] as const;
