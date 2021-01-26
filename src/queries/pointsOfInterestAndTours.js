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
        firstName
        lastName
        phone
        email
        fax
        webUrls {
          url
          description
        }
      }
      webUrls {
        url
        description
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
      contact {
        firstName
        lastName
        phone
        email
        fax
        webUrls {
          url
          description
        }
      }
      webUrls {
        url
        description
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
