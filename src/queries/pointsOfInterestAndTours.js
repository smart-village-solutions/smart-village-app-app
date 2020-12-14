import gql from 'graphql-tag';

export const GET_POINTS_OF_INTEREST_AND_TOURS = gql`
  query PointsOfInterestAndTours(
    $idsTour: [ID]
    $idsPoi: [ID]
    $limit: Int
    $orderPoi: PointsOfInterestOrder
    $orderTour: ToursOrder
  ) {
    pointsOfInterest(ids: $idsPoi, limit: $limit, order: $orderPoi) {
      id
      name
      category {
        name
      }
      description
      mediaContents {
        contentType
        captionText
        copyright
        sourceUrl {
          url
        }
      }
      addresses {
        city
        street
        zip
        kind
      }
      contact {
        email
        phone
        lastName
      }
      webUrls {
        url
      }
    }

    tours(ids: $idsTour, limit: $limit, order: $orderTour) {
      id
      name
      category {
        name
      }
      description
      mediaContents {
        contentType
        captionText
        copyright
        sourceUrl {
          url
        }
      }
      addresses {
        city
        street
        zip
        kind
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
