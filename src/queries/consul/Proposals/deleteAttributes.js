import gql from 'graphql-tag';

export const DELETE_DOCUMENT = gql`
  mutation deleteDocument($id: ID!) {
    deleteDocument(id: $id) {
      id
    }
  }
`;

export const DELETE_IMAGE = gql`
  mutation deleteImage($id: ID!) {
    deleteImage(id: $id) {
      id
    }
  }
`;
