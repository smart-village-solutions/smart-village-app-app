import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!]) {
    categories(ids: $ids) {
      id
      name
      pointsOfInterestCount
      toursCount
    }
  }
`;
