import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($limit: Int) {
    newsItems(limit: $limit) {
      id
      mainTitle: title
      publishedAt
      contentBlocks {
        id
        title
        intro
        body
        mediaContents {
          id
          contentType
          copyright
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
      settings {
        displayOnlySummary
        onlySummaryLinkText
      }
    }
  }
`;

export const GET_NEWS_ITEM = gql`
  query NewsItem($id: ID!) {
    newsItem(id: $id) {
      id
      mainTitle: title
      publishedAt
      contentBlocks {
        id
        title
        intro
        body
        mediaContents {
          id
          contentType
          copyright
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
      settings {
        displayOnlySummary
        onlySummaryLinkText
      }
    }
  }
`;
