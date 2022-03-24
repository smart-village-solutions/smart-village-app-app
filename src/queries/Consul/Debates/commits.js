import gql from 'graphql-tag';

export const ADD_COMMENT_TO_DEBATE = gql`
  mutation addCommentToDebate($debateId: ID!, $body: String!) {
    addCommentToDebate(debateId: $debateId, body: $body) {
      id
      body
      ancestry
      cachedVotesDown
      cachedVotesUp
      cachedVotesTotal
      commentableId
      commentableType
      confidenceScore
      parentId
      publicAuthor {
        id
        username
      }
      publicCreatedAt
      votesFor {
        nodes {
          id
          publicCreatedAt
          votableId
          votableType
          voteFlag
        }
      }
    }
  }
`;

export const ADD_REPLY_TO_COMMENT = gql`
  mutation addReplyToComment($commentId: ID!, $body: String!) {
    addReplyToComment(commentId: $commentId, body: $body) {
      id
      body
      ancestry
      cachedVotesDown
      cachedVotesUp
      cachedVotesTotal
      commentableId
      commentableType
      confidenceScore
      parentId
      publicAuthor {
        id
        username
      }
      publicCreatedAt
      votesFor {
        nodes {
          id
          publicCreatedAt
          votableId
          votableType
          voteFlag
        }
      }
    }
  }
`;
