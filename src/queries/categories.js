import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!]) {
    categories(ids: $ids) {
      id
      name
      pointsOfInterestCount
      toursCount
      children {
        id
        name
        pointsOfInterestCount
        toursCount
      }
    }
  }
`;

/*Kategorien Abfrage von untergeordneten Kategorien*/
export const GET_CHILDREN_CATEGORIES = gql`
  query Categories($ids: [ID!]) {
    categories(ids: $ids) {
      id
      name
      pointsOfInterestCount
      toursCount
      children {
        id
        name
        pointsOfInterestCount
        toursCount
      }
    }
  }
`;
