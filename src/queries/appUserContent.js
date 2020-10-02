import gql from 'graphql-tag';

export const CREATE_APP_USER_CONTENT = gql`
  mutation CreateAppUserContent($dataType: String!, $dataSource: String!, $content: String!) {
    createAppUserContent(dataType: $dataType, dataSource: $dataSource, content: $content) {
      id
    }
  }
`;
