import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  # TODO: "", $categoryId: ID" - needs to be used if declared
  query EventRecords($limit: Int, $offset: Int, $order: EventRecordsOrder) {
    # TODO: ", categoryId: $categoryId" to filter on a category
    #       main server PR necessary: https://github.com/ikuseiGmbH/smart-village-app-mainserver/pull/159
    eventRecords(limit: $limit, skip: $offset, order: $order) {
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
  # TODO: "", $categoryId: ID" - needs to be used if declared
  query EventRecords($limit: Int, $offset: Int, $order: EventRecordsOrder) {
    # TODO: ", categoryId: $categoryId" to filter on a category
    #       main server PR necessary: https://github.com/ikuseiGmbH/smart-village-app-mainserver/pull/159
    eventRecords(limit: $limit, skip: $offset, order: $order) {
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
      name
      eventRecordsCount
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
