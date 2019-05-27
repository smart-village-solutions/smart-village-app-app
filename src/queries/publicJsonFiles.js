import gql from 'graphql-tag';

export const GET_PUBLIC_JSON_FILE = gql`
  query PublicJsonFile($name: String!) {
    publicJsonFile(name: $name) {
      content
    }
  }
`;
