import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!], $excludeIds: [ID!], $location: String, $tagList: [String!]) {
    categories(ids: $ids, excludeIds: $excludeIds, tagList: $tagList) {
      id
      iconName
      name
      position
      pointsOfInterestTreeCount(location: $location)
      toursTreeCount(location: $location)
      parent {
        id
      }
      children {
        id
        iconName
        name
        position
        pointsOfInterestTreeCount(location: $location)
        toursTreeCount(location: $location)
        children {
          id
          iconName
          name
          position
          pointsOfInterestTreeCount(location: $location)
          toursTreeCount(location: $location)
          children {
            id
            iconName
            name
            position
            pointsOfInterestTreeCount(location: $location)
            toursTreeCount(location: $location)
            children {
              id
              iconName
              name
              position
              pointsOfInterestTreeCount(location: $location)
              toursTreeCount(location: $location)
              children {
                id
                iconName
                name
                position
                pointsOfInterestTreeCount(location: $location)
                toursTreeCount(location: $location)
                children {
                  id
                  iconName
                  name
                  position
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
      tagList
    }
  }
`;

// Keep the existing category query unchanged for legacy callers and servers.
export const GET_MAP_POI_CATEGORIES = gql`
  query MapPoiCategories {
    categories {
      id
      iconName
      name
      pointsOfInterestTreeCount
    }
  }
`;
