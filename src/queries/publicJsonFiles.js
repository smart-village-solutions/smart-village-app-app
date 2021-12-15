import gql from 'graphql-tag';

export const GET_PUBLIC_JSON_FILE = gql`
  query PublicJsonFile($name: String!, $version: String) {
    publicJsonFile(name: $name, version: $version) {
      content
    }
  }
`;
