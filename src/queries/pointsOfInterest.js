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
