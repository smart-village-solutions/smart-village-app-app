import gql from 'graphql-tag';

import { consultationPreviewEntries, filePreviewEntries, meetingPreviewEntries } from './fragments';

export const agendaItemQuery = [
  gql`
    query agendaItems($id: String!) {
      oParlAgendaItems(externalIds: [$id]) {
        id: externalId
        type
        name
        number
        order
        start
        auxiliaryFile {
          ${filePreviewEntries}
        }

        created
        consultation {
          ${consultationPreviewEntries}
        }
        deleted
        end
        keyword
        license
        meeting {
          ${meetingPreviewEntries}
        }
        modified
        public
        resolutionFile {
          ${filePreviewEntries}
        }
        resolutionText
        result
        web
      }
    }
  `,
  'oParlAgendaItems'
] as const;
