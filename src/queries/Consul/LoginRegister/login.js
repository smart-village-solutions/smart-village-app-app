import gql from 'graphql-tag';

export const CONSUL_LOGIN_USER = gql`
  mutation userLogin($email: String!, $password: String!) {
    userLogin(email: $email, password: $password) {
      credentials {
        accessToken
        uid
        client
      }
      authenticatable {
        username
        id
      }
    }
  }
`;
