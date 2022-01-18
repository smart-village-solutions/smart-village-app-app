import gql from 'graphql-tag';

export const GET_AREAS_AND_TOP_10 = gql`
  query getAreasAndTop10($areaId: ID!, $ids: [ID!]) {
    area {
      areaId: externalId
      value: name
    }

    publicServiceTypes(areaId: $areaId, externalIds: $ids) {
      id: externalId
      name
    }
  }
`;
