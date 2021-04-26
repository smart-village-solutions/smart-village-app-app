import gql from 'graphql-tag';

export const legislativeTermQuery = [
  gql`
    query legislativeTerm($id: String!) {
      oParlLegislativeTerms(externalIds: [$id]) {
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
        license
      }
    }
  `,
  'oParlLegislativeTerms'
];
