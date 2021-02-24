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
        id
        name
      }
      description
      mediaContents {
        id
        contentType
        captionText
        copyright
        sourceUrl {
          id
          url
        }
      }
      addresses {
        id
        city
        street
        zip
        kind
      }
      contact {
        id
        firstName
        lastName
        phone
        email
        fax
        webUrls {
          id
          url
          description
        }
      }
      webUrls {
        id
        url
        description
      }
    }

    tours(ids: $idsTour, limit: $limit, order: $orderTour) {
      id
      name
      category {
        id
        name
      }
      description
      mediaContents {
        id
        contentType
        captionText
        copyright
        sourceUrl {
          id
          url
        }
      }
      addresses {
        id
        city
        street
        zip
        kind
      }
      contact {
        id
        firstName
        lastName
        phone
        email
        fax
        webUrls {
          id
          url
          description
        }
      }
      webUrls {
        id
        url
        description
      }
      dataProvider {
        id
        logo {
          id
          url
        }
        name
      }
    }
  }
`;
