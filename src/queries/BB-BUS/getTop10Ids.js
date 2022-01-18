import gql from 'graphql-tag';

// TODO: replace this by using useStaticContent with versioning after 2.4.0
export const GET_TOP_10_IDS = gql`
  query PublicJsonFile {
    publicJsonFile(name: "bb-bus-top10-2.4.0") {
      content
    }
  }
`;
