import gql from 'graphql-tag';

export const CAST_VOTE_ON_DEBATE = gql`
  mutation castVoteOnDebate($debateId: ID!, $vote: String!) {
    castVoteOnDebate(debateId: $debateId, vote: $vote) {
      id
    }
  }
`;
