import gql from 'graphql-tag';

export const GET_POLLS = gql`
  query polls($filter: String!) {
    polls(filter: $filter) {
      nodes {
        id
        commentsCount
        published
        title
        startsAt
        endsAt
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
      token
      resultsReadyToBeShown
      comments {
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
      questions {
        title
        id
        questionAnswers {
          id
          title
          description
          totalVotes
          totalVotesPercentage
        }
        answersGivenByCurrentUser {
          id
          answer
        }
      }
    }
  }
`;
