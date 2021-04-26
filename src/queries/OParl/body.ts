import gql from 'graphql-tag';

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
          id: externalId
          type
          created
          modified
          deleted
          keyword
          web
          endDate
          name
          startDate
        }
        license
        licenseValidSince
        oparlSince
        rgs
        website
      }
    }
  `,
  'oParlBodies'
] as const;
