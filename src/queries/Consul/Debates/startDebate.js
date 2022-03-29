import gql from 'graphql-tag';

export const START_DEBATE = gql`
  mutation startDebate($attributes: DebateAttributes!) {
    startDebate(attributes: $attributes) {
      id
      publicAuthor {
        id
      }
      description
    }
  }
`;
