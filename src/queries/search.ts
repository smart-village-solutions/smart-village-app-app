import { gql } from 'graphql-request';

export const GET_SEARCH = gql`
  query Search($query: String, $filter: [SearchRecord!]) {
    search(query: $query, filter: $filter) {
      id
      recordType
    }
  }
`;
