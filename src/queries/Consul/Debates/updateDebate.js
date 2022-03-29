import gql from 'graphql-tag';

export const UPDATE_DEBATE = gql`
  mutation updateDebate($id: ID!, $attributes: DebateAttributes!) {
    updateDebate(id: $id, attributes: $attributes) {
      id
      publicAuthor {
        id
      }
      description
    }
  }
`;
