import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  query EventRecords($limit: Int) {
    eventRecords(limit: $limit) {
      id
      title
      dataProvider {
        name
      }
      dates {
        dateStart
        dateEnd
        timeStart
        timeEnd
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
      addresses {
        city
        street
        zip
      }
      contacts {
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
      prices: priceInformations {
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
    }
  }
`;
