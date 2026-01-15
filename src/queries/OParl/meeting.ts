import gql from 'graphql-tag';

import { agendaItemPreviewEntries, filePreviewEntries, meetingPreviewEntries } from './fragments';

export const meetingQuery = [
  gql`
    query meeting($id: String!) {
      oParlMeetings(externalIds: [$id]) {
        id: externalId
        type
        agendaItem {
          ${agendaItemPreviewEntries}
        }
        auxiliaryFile {
          ${filePreviewEntries}
        }
        cancelled
        conferenceLink
        created
        deleted
        end
        invitation {
          ${filePreviewEntries}
        }
        keyword
        license
        location {
          id: externalId
          type
          deleted
          locality
          postalCode
          room
          streetAddress
          subLocality
        }
        meetingState
        modified
        name
        organization {
          id: externalId
          type
          classification
          deleted
          name
          shortName
        }
        participant {
          id: externalId
          type
          affix
          deleted
          familyName
          formOfAddress
          givenName
          membership {
            id: externalId
            type
            deleted

            organization {
              id: externalId
              name
              shortName
            }

            endDate
            startDate
          }
          name
          title
        }
        resultsProtocol {
          ${filePreviewEntries}
        }
        start
        verbatimProtocol {
          ${filePreviewEntries}
        }
        web
      }
    }
  `,
  'oParlMeetings'
] as const;

export const meetingListQuery = [
  gql`
    query meetings($before: String, $after: String) {
      oParlMeetings(before: $before, after: $after) {
        ${meetingPreviewEntries}
      }
    }
  `,
  'oParlMeetings'
] as const;
