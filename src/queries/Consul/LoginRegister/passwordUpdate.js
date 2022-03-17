import gql from 'graphql-tag';

export const CONSUL_USER_SEND_PASSWORD_RESET = gql`
  mutation userSendPasswordReset($email: String!, $redirectUrl: String!) {
    userSendPasswordReset(email: $email, redirectUrl: $redirectUrl) {
      message
    }
  }
`;
