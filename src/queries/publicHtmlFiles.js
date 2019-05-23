import gql from 'graphql-tag';

export const GET_PUBLIC_HTML_FILE = gql`
  query PublicHtmlFile($name: String!) {
    publicHtmlFile(name: $name) {
      content
    }
  }
`;
