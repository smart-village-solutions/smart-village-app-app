import gql from 'graphql-tag';

export const START_PROPOSAL = gql`
  mutation submitProposal($attributes: ProposalAttributes!) {
    submitProposal(attributes: $attributes) {
      id
      title
    }
  }
`;
