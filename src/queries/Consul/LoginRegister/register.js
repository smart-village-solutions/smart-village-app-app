import gql from 'graphql-tag';

export const CONSUL_REGISTER_USER = gql`
  mutation userRegister(
    $username: String!
    $email: String!
    $password: String!
    $passwordConfirmation: String!
    $termsOfService: Boolean!
  ) {
    userRegister(
      username: $username
      email: $email
      password: $password
      passwordConfirmation: $passwordConfirmation
      termsOfService: $termsOfService
    ) {
      user {
        id
        username
      }
    }
  }
`;
