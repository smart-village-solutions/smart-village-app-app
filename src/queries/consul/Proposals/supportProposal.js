import gql from 'graphql-tag';

export const SUPPORT_PROPOSAL = gql`
  mutation supportProposal($id: ID!) {
    supportProposal(id: $id) {
      id
      cachedVotesUp
    }
  }
`;
