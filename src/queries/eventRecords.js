import gql from 'graphql-tag';

const defaultFragment = `
  id
  title
  listDate
  dates {
    id
    weekday
    dateFrom: dateStart
    dateTo: dateEnd
    timeFrom: timeStart
    timeTo: timeEnd
    description: timeDescription
  }
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
    geoLocation {
      id
      latitude
      longitude
    }
  }
`;

const dateFragment = `
  date {
    id
    dateFrom: dateStart
    dateTo: dateEnd
    timeFrom: timeStart
    timeTo: timeEnd
  }
`;

/**
 * @deprecated use GET_EVENT_RECORDS instead
 */
export const GET_EVENT_RECORDS_WITHOUT_DATE_FRAGMENT = gql`
  query EventRecords(
    $ids: [ID]
    $limit: Int
    $location: String
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
      location: $location
      skip: $offset
      order: $order
      categoryId: $categoryId
      dateRange: $dateRange
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
    ) {
      ...defaultFields
    }
  }

  fragment defaultFields on EventRecord {
    ${defaultFragment}
  }
`;

export const GET_EVENT_RECORDS = gql`
  query EventRecords(
    $ids: [ID]
    $limit: Int
    $take: Int
    $location: String
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
      take: $take
      location: $location
      skip: $offset
      order: $order
      categoryId: $categoryId
      dateRange: $dateRange
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
    ) {
      ...defaultFields
      ...dateFields
    }
  }

  fragment defaultFields on EventRecord {
    ${defaultFragment}
  }

  fragment dateFields on EventRecord {
    ${dateFragment}
  }
`;

export const GET_EVENT_RECORDS_COUNT = gql`
  query EventRecords(
    $ids: [ID]
    $limit: Int
    $take: Int
    $location: String
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
      take: $take
      location: $location
      skip: $offset
      order: $order
      categoryId: $categoryId
      dateRange: $dateRange
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
    ) {
      id
      ...dateFields
    }
  }

  fragment dateFields on EventRecord {
    ${dateFragment}
  }
`;

export const GET_EVENT_RECORDS_AND_CATEGORIES = gql`
  query EventRecordsAndCategories {
    eventRecords {
      id
      ...dateFields
    }
    categories {
      id
      name
      upcomingEventRecordsCount
    }
  }

  fragment dateFields on EventRecord {
    ${dateFragment}
  }
`;

export const GET_EVENT_RECORD = gql`
  query EventRecord($id: ID!) {
    eventRecord(id: $id) {
      ...defaultFields
      ...dateFields
      description
      category {
        id
        name
      }
      categories {
        id
        name
      }
      dataProvider {
        id
        logo {
          id
          url
        }
        name
        dataType
        notice
      }
      settings {
        displayOnlySummary
        onlySummaryLinkText
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
            description
          }
        }
      }
    }
  }

  fragment defaultFields on EventRecord {
    ${defaultFragment}
  }

  fragment dateFields on EventRecord {
    ${dateFragment}
  }
`;

export const CREATE_EVENT_RECORDS = gql`
  mutation CreateEventRecord(
    $title: String!
    $categoryName: String
    $description: String
    $dateStart: String
    $dateEnd: String
    $timeStart: String
    $timeEnd: String
    $city: String
  ) {
    createEventRecord(
      title: $title
      categoryName: $categoryName
      description: $description
      dates: [
        { dateStart: $dateStart, dateEnd: $dateEnd, timeStart: $timeStart, timeEnd: $timeEnd }
      ]
      addresses: [{ city: $city, kind: "default" }]
    ) {
      id
      title
    }
  }
`;

export const GET_EVENT_RECORDS_ADDRESSES = gql`
  query {
    eventRecordsAddresses {
      city
    }
  }
`;
