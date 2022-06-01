import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!], $excludeIds: [ID!], $location: String) {
    categories(ids: $ids, excludeIds: $excludeIds) {
      id
      name
      pointsOfInterestCount(location: $location)
      pointsOfInterestTreeCount(location: $location)
      toursCount(location: $location)
      toursTreeCount(location: $location)
      parent {
        id
      }
      children {
        id
        name
        pointsOfInterestCount(location: $location)
        pointsOfInterestTreeCount(location: $location)
        toursCount(location: $location)
        toursTreeCount(location: $location)
        children {
          id
          name
          pointsOfInterestCount(location: $location)
          pointsOfInterestTreeCount(location: $location)
          toursCount(location: $location)
          toursTreeCount(location: $location)
          children {
            id
            name
            pointsOfInterestCount(location: $location)
            pointsOfInterestTreeCount(location: $location)
            toursCount(location: $location)
            toursTreeCount(location: $location)
            children {
              id
              name
              pointsOfInterestCount(location: $location)
              pointsOfInterestTreeCount(location: $location)
              toursCount(location: $location)
              toursTreeCount(location: $location)
              children {
                id
                name
                pointsOfInterestCount(location: $location)
                pointsOfInterestTreeCount(location: $location)
                toursCount(location: $location)
                toursTreeCount(location: $location)
                children {
                  id
                  name
                  pointsOfInterestCount(location: $location)
                  pointsOfInterestTreeCount(location: $location)
                  toursCount(location: $location)
                  toursTreeCount(location: $location)
                }
              }
            }
          }
        }
      }
    }
  }
`;
