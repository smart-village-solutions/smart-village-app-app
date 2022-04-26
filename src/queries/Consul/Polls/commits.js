import gql from 'graphql-tag';

export const ADD_COMMENT_TO_POLLS = gql`
  mutation addCommentToPoll($pollId: ID!, $body: String!) {
    addCommentToPoll(pollId: $pollId, body: $body) {
      id
    }
  }
`;
