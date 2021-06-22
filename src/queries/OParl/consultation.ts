import gql from 'graphql-tag';

import {
  agendaItemPreviewEntries,
  meetingPreviewEntries,
  organizationPreviewEntries,
  paperPreviewEntries
} from './fragments';

export const consultationQuery = [
  gql`
    query consultations($id: String!) {
      oParlConsultations(externalIds: [$id]) {
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
        authoritative
        created
        keyword
        license
        modified
        organization {
          ${organizationPreviewEntries}
        }
        role
        web
      }
    }
  `,
  'oParlConsultations'
] as const;
