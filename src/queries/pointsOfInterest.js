import gql from 'graphql-tag';

export const GET_POINTS_OF_INTEREST = gql`
  query PointsOfInterest(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: PointsOfInterestOrder
    $category: String
  ) {
    pointsOfInterest(ids: $ids, limit: $limit, skip: $offset, order: $order, category: $category) {
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
        geoLocation {
          latitude
          longitude
        }
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
  }
`;

export const GET_POINT_OF_INTEREST = gql`
  query PointOfInterest($id: ID!) {
    pointOfInterest(id: $id) {
      id
      title: name
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
        kind
        addition
        geoLocation {
          latitude
          longitude
        }
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
      priceInformations {
        category
        amount
        description
        maxChildrenCount
        maxAdultCount
        groupPrice
      }
      openingHours {
        sortNumber
        weekday
        timeFrom
        timeTo
        open
        dateFrom
        dateTo
        description
      }
      operatingCompany {
        name
        address {
          id
          kind
          addition
          street
          zip
          city
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
      }
      lunches {
        id
      }
    }
  }
`;
