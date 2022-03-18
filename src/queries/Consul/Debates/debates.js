import gql from 'graphql-tag';

export const GET_DEBATES = gql`
  query {
    debates {
      nodes {
        id
        title
        description
        cachedVotesUp
        cachedVotesDown
        cachedVotesTotal
        publicAuthor {
          username
        }
        comments {
          nodes {
            id
            parentId
            body
          }
        }
      }
    }
  }
`;
