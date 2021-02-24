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
        geoLocation {
          id
          latitude
          longitude
        }
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
  }
`;

export const GET_POINT_OF_INTEREST = gql`
  query PointOfInterest($id: ID!) {
    pointOfInterest(id: $id) {
      id
      title: name
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
      dataProvider {
        id
        logo {
          id
          url
        }
        name
        dataType
      }
      addresses {
        id
        city
        street
        zip
        kind
        addition
        geoLocation {
          id
          latitude
          longitude
        }
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
      priceInformations {
        id
        category
        amount
        description
        maxChildrenCount
        maxAdultCount
        groupPrice
      }
      openingHours {
        id
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
        id
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
      }
      lunches {
        id
      }
    }
  }
`;
