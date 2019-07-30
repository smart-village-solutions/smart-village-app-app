import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($limit: Int) {
    newsItems(limit: $limit) {
      id
      publishedAt
      contentBlocks {
        title
        body
        mediaContents {
          contentType
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

export const GET_NEWS_ITEM = gql`
  query NewsItem($id: ID!) {
    newsItem(id: $id) {
      id
      publishedAt
      contentBlocks {
        title
        body
        mediaContents {
          contentType
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
