import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems($ids: [ID], $limit: Int, $offset: Int, $dataProvider: String, $categoryId: ID) {
    newsItems(
      ids: $ids
      limit: $limit
      skip: $offset
      dataProvider: $dataProvider
      categoryId: $categoryId
    ) {
      id
      mainTitle: title
      publishedAt
      categories {
        id
      }
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
            id
            url
          }
        }
      }
      sourceUrl {
        id
        url
      }
      dataProvider {
        id
        logo {
          id
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
  query NewsItems($limit: Int, $offset: Int, $dataProvider: String, $categoryId: ID) {
    newsItems(limit: $limit, skip: $offset, dataProvider: $dataProvider, categoryId: $categoryId) {
      id
      mainTitle: title
      publishedAt
      categories {
        id
      }
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
        id
        url
      }
      dataProvider {
        id
        logo {
          id
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
      id
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
            id
            url
          }
        }
      }
      sourceUrl {
        id
        url
      }
      dataProvider {
        id
        logo {
          id
          url
        }
        name
      }
      categories {
        id
        name
      }
      settings {
        displayOnlySummary
        onlySummaryLinkText
      }
    }
  }
`;
