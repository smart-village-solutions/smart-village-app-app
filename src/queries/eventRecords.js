import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  query EventRecords(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: EventRecordsOrder
    $categoryId: ID
  ) {
    eventRecords(ids: $ids, limit: $limit, skip: $offset, order: $order, categoryId: $categoryId) {
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
      priceInformations {
        name
        amount
      }
    }
  }
`;

export const GET_EVENT_RECORDS_AND_CATEGORIES = gql`
  query EventRecords($limit: Int, $offset: Int, $order: EventRecordsOrder, $categoryId: ID) {
    eventRecords(limit: $limit, skip: $offset, order: $order, categoryId: $categoryId) {
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
      priceInformations {
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
        name
      }
      categories {
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
        email
        phone
        lastName
        firstName
      }
      webUrls: urls {
        url
        description
      }
      dataProvider {
        logo {
          url
        }
        name
      }
      priceInformations {
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
          }
        }
      }
    }
  }
`;
