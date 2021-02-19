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
        id
        logo {
          url
        }
        name
        dataType
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

// TODO: add newsItems and tours
// TODO: which data is really necessary in each?
export const GET_POINT_OF_INTEREST_CROSS_DATA = gql`
  query PointOfInterestCrossData(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $orderEventRecords: EventRecordsOrder
    $dataProviderId: ID
    $categoryId: ID
    $dateRange: [String]
  ) {
    eventRecords(
      ids: $ids
      limit: $limit
      skip: $offset
      order: $orderEventRecords
      dataProviderId: $dataProviderId
      categoryId: $categoryId
      dateRange: $dateRange
    ) {
      id
      category {
        name
      }
      dates {
        weekday
        dateFrom: dateStart
        dateTo: dateEnd
        timeFrom: timeStart
        timeTo: timeEnd
        description: timeDescription
      }
      listDate
      title
      description
      mediaContents {
        id
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
        addition
      }
      contacts {
        id
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
      webUrls: urls {
        url
        description
      }
      priceInformations {
        name
        amount
      }
    }
  }
`;
