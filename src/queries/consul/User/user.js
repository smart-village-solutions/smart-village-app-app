import gql from 'graphql-tag';

export const USER = gql`
  query user($id: ID!) {
    user(id: $id) {
      id
      username
      publicDebates {
        nodes {
          id
          title
          publicCreatedAt
          commentsCount
          cachedVotesTotal
        }
      }
      publicProposals {
        nodes {
          id
          title
          commentsCount
          publicCreatedAt
          published
        }
      }
      publicComments {
        nodes {
          id
          body
          cachedVotesTotal
          publicCreatedAt
          commentableTitle
          publicAuthor {
            id
            username
          }
        }
      }
    }
  }
`;
