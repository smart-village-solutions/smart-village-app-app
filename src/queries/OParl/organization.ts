import gql from 'graphql-tag';

export const organizationQuery = [
  gql`
    query organizations {
      oParlOrganizations {
        id: externalId
        name
        shortName
        membership {
          person {
            id: externalId
            type
            affix
            familyName
            formOfAddress
            givenName
            membership {
              organization {
                name
                shortName
              }
            }
          }
        }
      }
    }
  `,
  'oParlOrganizations'
] as const;
