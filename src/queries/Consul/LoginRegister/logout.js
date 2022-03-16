import gql from 'graphql-tag';

export const CONSUL_LOGOUT_USER = gql`
  mutation userLogout {
    userLogout {
      authenticatable {
        username
      }
    }
  }
`;
