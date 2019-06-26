import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  query EventRecords($limit: Int) {
    eventRecords(limit: $limit) {
      id
      createdAt
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
      createdAt
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
