import gql from 'graphql-tag';

export const GET_POLLS = gql`
  query polls($filter: String!) {
    polls(filter: $filter) {
      nodes {
        id
        commentsCount
        published
        title
        createdAt
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
      description
      summary
      startsAt
      endsAt
      createdAt
      comments {
        id
        parentId
        body
        cachedVotesUp
        cachedVotesDown
        cachedVotesTotal
        publicCreatedAt
        publicAuthor {
          id
          username
        }
      }
      questions {
        title
        id
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
