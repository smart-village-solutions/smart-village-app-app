import gql from 'graphql-tag';

export const UPDATE_PROPOSAL = gql`
  mutation updateProposal($id: ID!, $attributes: ProposalAttributes!) {
    updateProposal(id: $id, attributes: $attributes) {
      id
      publicAuthor {
        id
      }
      description
    }
  }
`;
