import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  query EventRecords(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: EventRecordsOrder
    $categoryId: ID
    $dateRange: [String]
    $dataProvider: String
    $dataProviderId: ID
  ) {
    eventRecords(
      ids: $ids
      limit: $limit
      skip: $offset
      order: $order
      categoryId: $categoryId
      dateRange: $dateRange
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
    ) {
      id
      category {
        id
        name
      }
      dates {
        id
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
          id
          url
          description
        }
      }
      webUrls: urls {
        id
        url
        description
      }
      priceInformations {
        id
        name
        amount
      }
    }
  }
`;

export const GET_EVENT_RECORDS_AND_CATEGORIES = gql`
  query EventRecords(
    $limit: Int
    $offset: Int
    $order: EventRecordsOrder
    $categoryId: ID
    $dateRange: [String]
    $dataProvider: String
    $dataProviderId: ID
  ) {
    eventRecords(
      limit: $limit
      skip: $offset
      order: $order
      categoryId: $categoryId
      dateRange: $dateRange
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
    ) {
      id
      category {
        id
        name
      }
      dates {
        id
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
          id
          url
          description
        }
      }
      webUrls: urls {
        id
        url
        description
      }
      priceInformations {
        id
        name
        amount
      }
    }
    categories {
      id
      name
      upcomingEventRecordsCount
    }
  }
`;

export const GET_EVENT_RECORD = gql`
  query EventRecord($id: ID!) {
    eventRecord(id: $id) {
      id
      category {
        id
        name
      }
      categories {
        id
        name
      }
      dates {
        id
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
          id
          url
          description
        }
      }
      webUrls: urls {
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
        dataType
      }
      priceInformations {
        id
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
      operatingCompany: organizer {
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
          }
        }
      }
    }
  }
`;
