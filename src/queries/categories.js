import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!], $excludeIds: [ID!]) {
    categories(ids: $ids, excludeIds: $excludeIds) {
      id
      name
      pointsOfInterestCount
      pointsOfInterestTreeCount
      toursCount
      toursTreeCount
      parent {
        id
      }
      children {
        id
        name
        pointsOfInterestCount
        pointsOfInterestTreeCount
        toursCount
        toursTreeCount
        children {
          id
          name
          pointsOfInterestCount
          pointsOfInterestTreeCount
          toursCount
          toursTreeCount
          children {
            id
            name
            pointsOfInterestCount
            pointsOfInterestTreeCount
            toursCount
            toursTreeCount
            children {
              id
              name
              pointsOfInterestCount
              pointsOfInterestTreeCount
              toursCount
              toursTreeCount
              children {
                id
                name
                pointsOfInterestCount
                pointsOfInterestTreeCount
                toursCount
                toursTreeCount
                children {
                  id
                  name
                  pointsOfInterestCount
                  pointsOfInterestTreeCount
                  toursCount
                  toursTreeCount
                }
              }
            }
          }
        }
      }
    }
  }
`;
