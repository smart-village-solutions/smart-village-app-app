import gql from 'graphql-tag';

export const GET_EVENT_RECORDS = gql`
  query EventRecords($limit: Int) {
    eventRecords(limit: $limit) {
      id
      title
      subtitle: createdAt
    }
  }
`;
