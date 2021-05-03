import gql from 'graphql-tag';

export const systemQuery = [
  gql`
    query systems($id: String!) {
      oParlSystems(externalIds: [$id]) {
        id: externalId
        type
        created
        modified
        deleted
        keyword
        web
        license
        name
        oparlVersion
        body {
          ...bodyPreview
        }
        contactEmail
        contactName
        otherOparlVersions
        product
        vendor
        website
      }
    }
  `,
  'oParlSystems'
] as const;
