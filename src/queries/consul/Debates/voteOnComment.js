import gql from 'graphql-tag';

export const CAST_VOTE_ON_COMMENT = gql`
  mutation castVoteOnComment($commentId: ID!, $vote: String!) {
    castVoteOnComment(commentId: $commentId, vote: $vote) {
      id
    }
  }
`;
