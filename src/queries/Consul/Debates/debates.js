import gql from 'graphql-tag';

export const GET_DEBATES = gql`
  query {
    debates {
      nodes {
        id
        title
        publicCreatedAt
        commentsCount
        cachedVotesTotal
      }
    }
  }
`;

export const GET_DEBATE = gql`
  query debate($id: ID!) {
    debate(id: $id) {
      id
      title
      description
      cachedVotesUp
      cachedVotesDown
      cachedVotesTotal
      publicCreatedAt
      cachedVotesDown
      cachedVotesTotal
      cachedVotesUp
      commentsCount
      confidenceScore
      hotScore
      publicAuthor {
        id
        username
      }
      tags {
        nodes {
          id
          name
          kind
          taggingsCount
        }
      }
      votesFor {
        nodes {
          id
          publicCreatedAt
          votableId
          votableType
          voteFlag
        }
      }
      comments {
        nodes {
          id
          parentId
          body
          ancestry
          cachedVotesUp
          cachedVotesDown
          cachedVotesTotal
          commentableId
          commentableType
          confidenceScore
          publicCreatedAt
          publicAuthor {
            id
            username
          }
        }
      }
    }
  }
`;
