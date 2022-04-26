import gql from 'graphql-tag';

export const ADD_COMMENT_TO_PROPOSAL = gql`
  mutation addCommentToProposal($proposalId: ID!, $body: String!) {
    addCommentToProposal(proposalId: $proposalId, body: $body) {
      id
    }
  }
`;
