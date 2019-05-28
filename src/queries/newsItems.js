import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($limit: Int) {
    newsItems(limit: $limit) {
      id
      createdAt
      contentBlocks {
        title
      }
      dataProvider {
        name
      }
    }
  }
`;

export const GET_NEWS_ITEM = gql`
  query NewsItem($id: ID!) {
    newsItem(id: $id) {
      id
      createdAt
      contentBlocks {
        title
        body
        mediaContents {
          sourceUrl {
            url
          }
        }
      }
      sourceUrl {
        url
      }
      dataProvider {
        logo {
          url
        }
        name
      }
    }
  }
`;
