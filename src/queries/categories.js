import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!], $excludeIds: [ID!]) {
    categories(ids: $ids, excludeIds: $excludeIds) {
      id
      name
      pointsOfInterestCount
      toursCount
      parent {
        id
      }
      children {
        id
        name
        pointsOfInterestCount
        toursCount
        children {
          id
          name
          pointsOfInterestCount
          toursCount
          children {
            id
            name
            pointsOfInterestCount
            toursCount
            children {
              id
              name
              pointsOfInterestCount
              toursCount
              children {
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
          }
        }
      }
    }
  }
`;
