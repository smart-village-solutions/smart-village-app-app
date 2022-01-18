import gql from 'graphql-tag';

export const GET_SERVICES = gql`
  query getServices($areaId: ID!, $ids: [ID!]) {
    publicServiceTypes(areaId: $areaId, externalIds: $ids) {
      id: externalId
      name
    }
  }
`;
