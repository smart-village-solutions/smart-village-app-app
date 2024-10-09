import gql from 'graphql-tag';

export const GET_RESOURCE_FILTERS = gql`
  query ResourceFilters {
    resourceFilters {
      config
      dataResourceType
    }
  }
`;
