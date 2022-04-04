import gql from 'graphql-tag';

export const GET_POLLS = gql`
  query polls($filter: String!) {
    polls(filter: $filter) {
      nodes {
        id
        commentsCount
        published
        title
      }
    }
  }
`;

export const GET_POLL = gql`
  query poll($id: ID!) {
    poll(id: $id) {
      id
      authorId
      commentsCount
      published
      title
      token
      comments {
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
      questions {
        title
        questionAnswers {
          id
          title
          description
        }
        answersGivenByCurrentUser {
          id
          answer
        }
      }
    }
  }
`;
