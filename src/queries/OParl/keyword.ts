import gql from 'graphql-tag';
import {
  agendaItemPreviewEntries,
  consultationPreviewEntries,
  filePreviewEntries,
  legislativeTermPreviewEntries,
  locationPreviewEntries,
  meetingPreviewEntries,
  membershipPreviewEntries,
  organizationPreviewEntries,
  paperPreviewEntries,
  personPreviewEntries
} from './fragments';

export const keywordQuery = gql`
  query keyword($keywords: [String!]) {
    oParlAgendaItems(keyword: $keywords) {
      ${agendaItemPreviewEntries}
    }

    oParlConsultations(keyword: $keywords) {
      ${consultationPreviewEntries}
    }

    oParlFiles(keyword: $keywords) {
      ${filePreviewEntries}
    }

    oParlLegislativeTerms(keyword: $keywords) {
      ${legislativeTermPreviewEntries}
    }

    oParlLocations(keyword: $keywords) {
      ${locationPreviewEntries}
    }

    oParlMeetings(keyword: $keywords) {
      ${meetingPreviewEntries}
    }

    oParlMemberships(keyword: $keywords) {
      ${membershipPreviewEntries}
    }

    oParlOrganizations(keyword: $keywords) {
      ${organizationPreviewEntries}
    }

    oParlPapers(keyword: $keywords) {
      ${paperPreviewEntries}
    }

    oParlPersons(keyword: $keywords) {
      ${personPreviewEntries}
    }
  }
`;

export const keywordListQuery = gql`
  query keywords {
    oParlKeywordList
  }
`;
