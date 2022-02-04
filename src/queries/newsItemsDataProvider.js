import gql from 'graphql-tag';

export const GET_NEWS_ITEMS_DATA_PROVIDERS = gql`
  query dataProviders {
    newsItemsDataProviders {
      id
      name
    }
  }
`;
