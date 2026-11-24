import gql from 'graphql-tag';

export const GET_CATEGORIES = gql`
  query Categories($ids: [ID!], $excludeIds: [ID!], $location: String, $tagList: [String!]) {
    categoryHierarchy: categories {
      id
      name
      parent {
        id
      }
    }
    categoryPointsOfInterest: pointsOfInterest(location: $location) {
      id
      payload
      visible
      categories {
        id
        name
      }
      category {
        id
        name
      }
    }
    categoryTours: tours(location: $location) {
      id
      payload
      visible
      categories {
        id
        name
      }
      category {
        id
        name
      }
    }
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
