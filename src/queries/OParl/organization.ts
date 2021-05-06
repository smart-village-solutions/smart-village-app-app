import gql from 'graphql-tag';

import {
  bodyPreviewEntries,
  consultationPreviewEntries,
  locationPreviewEntries,
  meetingPreviewEntries,
  membershipPreviewEntries,
  organizationPreviewEntries,
  personPreviewEntries
} from './fragments';

export const simpleOrganizationListQuery = [
  gql`
    query organizationList {
      oParlOrganizations {
        id: externalId
        classification
        name
        shortName
        membership {
          externalId
        }
      }
    }
  `,
  'oParlOrganizations'
] as const;

export const organizationListQuery = [
  gql`
    query organizationList($pageSize: Int, $offset: Int) {
      oParlOrganizations(pageSize: $pageSize, offset: $offset) {
        ${organizationPreviewEntries}
      }
    }
  `,
  'oParlOrganizations'
] as const;

export const organizationMembershipQuery = [
  gql`
    query organizationMembers($id: String!, $offset: Int, $pageSize: Int) {
      oParlOrganizations(externalIds: [$id], offset: $offset, pageSize: $pageSize) {
        id: externalId
        name
        shortName
        membership {
          person {
            ${personPreviewEntries}
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
