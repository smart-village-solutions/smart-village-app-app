import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($limit: Int, $offset: Int, $categoryId: ID) {
    newsItems(limit: $limit, skip: $offset, categoryId: $categoryId) {
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
          captionText
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

export const GET_FILTERED_NEWS_ITEMS = gql`
  query NewsItems($limit: Int, $offset: Int, $dataProvider: String, $categoryId: ID) {
    newsItems(limit: $limit, skip: $offset, dataProvider: $dataProvider, categoryId: $categoryId) {
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
          captionText
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

export const GET_FILTERED_NEWS_ITEMS_AND_DATA_PROVIDERS = gql`
  query NewsItems($limit: Int, $offset: Int, $dataProvider: String, $categoryId: ID) {
    newsItems(limit: $limit, skip: $offset, dataProvider: $dataProvider, categoryId: $categoryId) {
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
          captionText
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
    dataProviders: newsItemsDataProviders(categoryId: $categoryId) {
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
          captionText
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
