import gql from 'graphql-tag';

export const GET_PROPOSALS = gql`
  query {
    proposals {
      nodes {
        id
        title
        publicCreatedAt
        commentsCount
      }
    }
  }
`;

export const GET_PROPOSAL = gql`
  query proposal($id: ID!) {
    proposal(id: $id) {
      id
      title
      description
      cachedVotesUp
      summary
      currentUserHasVoted
      publicCreatedAt
      cachedVotesUp
      commentsCount
      published
      videoUrl
      publicAuthor {
        id
        username
      }
      tags {
        nodes {
          id
          name
        }
      }
      documents {
        id
        url
      }
      imageUrlMedium
      mapLocation {
        id
        latitude
        longitude
        zoom
      }
      comments {
        nodes {
          id
          parentId
          body
          cachedVotesUp
          cachedVotesDown
          cachedVotesTotal
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
