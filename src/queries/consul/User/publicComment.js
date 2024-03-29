import gql from 'graphql-tag';

export const PUBLIC_COMMENT = gql`
  query comment($id: ID!) {
    comment(id: $id) {
      id
      parentId
      body
      cachedVotesUp
      cachedVotesDown
      cachedVotesTotal
      publicCreatedAt
      commentableTitle
      votesFor {
        nodes {
          voteFlag
        }
      }
      publicAuthor {
        id
        username
      }
    }
  }
`;
