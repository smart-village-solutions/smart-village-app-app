import gql from 'graphql-tag';

export const GET_POINTS_OF_INTEREST = gql`
  query PointsOfInterest($limit: Int) {
    pointsOfInterest(limit: $limit) {
      id
      name
      category: categoryName
      mediaContents {
        contentType
        sourceUrl {
          url
        }
      }
    }
  }
`;

export const GET_POINT_OF_INTEREST = gql`
  query PointOfInterest($id: ID!) {
    pointOfInterest(id: $id) {
      id
      createdAt
      name
      category: categoryName
      description
      mediaContents {
        contentType
        sourceUrl {
          url
        }
      }
      dataProvider {
        logo {
          url
        }
        name
      }
    }
  }
`;
