import gql from 'graphql-tag';

export const DELETE_DOCUMENT = gql`
  mutation deleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      id
    }
  }
`;
