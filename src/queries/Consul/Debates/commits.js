import gql from 'graphql-tag';

export const ADD_COMMENT_TO_DEBATE = gql`
  mutation addCommentToDebate($debateId: ID!, $body: String!) {
    addCommentToDebate(debateId: $debateId, body: $body) {
      id
    }
  }
`;

export const ADD_REPLY_TO_COMMENT = gql`
  mutation addReplyToComment($commentId: ID!, $body: String!) {
    addReplyToComment(commentId: $commentId, body: $body) {
      id
    }
  }
`;

export const DELETE_COMMENT = gql`
  mutation deleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
    }
  }
`;
