import gql from 'graphql-tag';

export const GET_PUBLIC_HTML_FILE = gql`
  query PublicHtmlFile($name: String!, $version: String) {
    publicHtmlFile(name: $name, version: $version) {
      content
    }
  }
`;
