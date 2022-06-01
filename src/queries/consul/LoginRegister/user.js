import gql from 'graphql-tag';

export const CONSUL_USER = gql`
  query user($id: ID!) {
    user(id: $id) {
      id
      username
    }
  }
`;
