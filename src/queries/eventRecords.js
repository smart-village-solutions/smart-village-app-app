import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  query EventRecords($limit: Int) {
    eventRecords(limit: $limit) {
      id
      category {
        name
      }
      dates {
        dateStart
        dateEnd
        timeStart
        timeEnd
      }
      title
      description
      mediaContents {
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
      openingHours: dates {
        weekday
        dateFrom: dateStart
        dateTo: dateEnd
        timeFrom: timeStart
        timeTo: timeEnd
        description: timeDescription
      }
      title
      description
      mediaContents {
        sourceUrl {
          url
        }
      }
      addresses {
        city
        street
        zip
      }
      contacts {
        id
        email
        phone
        lastName
      }
      webUrls: urls {
        url
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
