import gql from 'graphql-tag';

export const GET_POINTS_OF_INTEREST = gql`
  query PointsOfInterest($limit: Int) {
    pointsOfInterest(limit: $limit) {
      id
      name
      category {
        name
      }
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
      category {
        name
      }
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
      addresses {
        city
        street
        zip
      }
      contact {
        email
        phone
      }
      webUrls {
        url
      }
      prices {
        name
        groupPrice
        amount
        ageFrom
        ageTo
        category
        description
        maxChildrenCount
        maxAdultCount
        minAdultCount
        minChildrenCount
      }
      openingHours {
        weekday
        timeFrom
        timeTo
        description
      }
    }
  }
`;
