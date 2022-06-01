import gql from 'graphql-tag';

export const GET_DEBATES = gql`
  query {
    debates {
      nodes {
        id
        title
        publicCreatedAt
        commentsCount
        cachedVotesUp
        cachedVotesDown
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
    }
  }
`;
