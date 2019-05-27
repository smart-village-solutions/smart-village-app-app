import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($limit: Int) {
    newsItems(limit: $limit) {
      id
      contentBlocks {
        title
        subtitle: createdAt
      }
    }
  }
`;
