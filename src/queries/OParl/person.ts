import gql from 'graphql-tag';

export const personQuery = [
  gql`
    query persons($id: String!) {
      oParlPersons(externalIds: [$id]) {
        id: externalId
        type
        affix
        deleted
        familyName
        formOfAddress
        givenName
        membership {
          ...mempershipPreviewEntries
        }
        name
        title
        body {
          ...bodyPreviewEntries
        }
        created
        email
        gender
        keyword
        license
        life
        lifeSource
        location {
          ...locationPreviewEntries
        }
        modified
        phone
        status
        web
      }
    }

    fragment mempershipPreviewEntries on OParlMembership {
      id: externalId
      type
      deleted
      onBehalfOf {
        ...organizationPreviewEntries
      }
      organization {
        ...organizationPreviewEntries
      }
      endDate
      startDate
    }

    fragment bodyPreviewEntries on OParlBody {
      id: externalId
      type
      deleted
      name
    }

    fragment locationPreviewEntries on OParlLocation {
      id: externalId
      type
      deleted
      locality
      postalCode
      room
      streetAddress
      subLocality
    }

    fragment organizationPreviewEntries on OParlOrganization {
      id: externalId
      type
      classification
      deleted
      name
      shortName
    }
  `,
  'oParlPersons'
] as const;

export const personListQuery = [
  gql`
    query persons($offset: Int, $pageSize: Int) {
      oParlPersons(offset: $offset, pageSize: $pageSize) {
        id: externalId
        type
        affix
        familyName
        formOfAddress
        givenName
        membership {
          organization {
            classification
            name
            shortName
          }
        }
      }
    }
  `,
  'oParlPersons'
] as const;
