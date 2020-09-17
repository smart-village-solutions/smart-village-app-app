import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($limit: Int, $offset: Int, $dataProvider: String) {
    newsItems(limit: $limit, skip: $offset, dataProvider: $dataProvider) {
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

export const GET_NEWS_ITEMS_AND_DATA_PROVIDERS = gql`
  query NewsItems($limit: Int, $offset: Int, $dataProvider: String) {
    newsItems(limit: $limit, skip: $offset, dataProvider: $dataProvider) {
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
    dataProviders: newsItemsDataProviders {
      name
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
