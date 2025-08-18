import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!], $excludeIds: [ID!], $location: String) {
    categories(ids: $ids, excludeIds: $excludeIds) {
      id
      iconName
      name
      pointsOfInterestTreeCount(location: $location)
      toursTreeCount(location: $location)
      parent {
        id
      }
      children {
        id
        iconName
        name
        pointsOfInterestTreeCount(location: $location)
        toursTreeCount(location: $location)
        children {
          id
          iconName
          name
          pointsOfInterestTreeCount(location: $location)
          toursTreeCount(location: $location)
          children {
            id
            iconName
            name
            pointsOfInterestTreeCount(location: $location)
            toursTreeCount(location: $location)
            children {
              id
              iconName
              name
              pointsOfInterestTreeCount(location: $location)
              toursTreeCount(location: $location)
              children {
                id
                iconName
                name
                pointsOfInterestTreeCount(location: $location)
                toursTreeCount(location: $location)
                children {
                  id
                  iconName
                  name
                  pointsOfInterestTreeCount(location: $location)
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

export const GET_CATEGORIES_FILTER = gql`
  query Categories($ids: [ID!], $tagList: [String!]) {
    categories(ids: $ids, tagList: $tagList) {
      id
      iconName
      name
    }
  }
`;
