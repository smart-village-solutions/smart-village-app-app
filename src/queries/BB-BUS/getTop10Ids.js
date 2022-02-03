import gql from 'graphql-tag';

import appJson from '../../../app.json';

// TODO: refactor to use useStaticContent
export const GET_TOP_10_IDS = gql`
  query PublicJsonFile {
    publicJsonFile(name: "bb-bus-top10", version: "${appJson.expo.version}") {
      content
    }
  }
`;
