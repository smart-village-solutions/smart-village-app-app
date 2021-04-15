import gql from 'graphql-tag';

export const personQuery = [
  gql`
    query persons {
      oParlPersons {
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
  `,
  'oParlPersons'
] as const;
