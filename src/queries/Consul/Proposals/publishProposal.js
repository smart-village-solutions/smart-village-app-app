import gql from 'graphql-tag';

export const PUBLISH_PROPOSAL = gql`
  mutation publishProposal($id: ID!) {
    publishProposal(id: $id) {
      id
      title
    }
  }
`;
