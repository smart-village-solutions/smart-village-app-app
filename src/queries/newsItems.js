import gql from 'graphql-tag';

export const GET_NEWS_ITEMS = gql`
  query NewsItems(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $dataProvider: String
    $dataProviderId: ID
    $dateRange: [String]
    $excludeDataProviderIds: [ID]
    $excludeMowasRegionalKeys: [String]
    $categoryId: ID
    $categoryIds: [ID]
  ) {
    newsItems(
      ids: $ids
      limit: $limit
      skip: $offset
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
      dateRange: $dateRange
      excludeDataProviderIds: $excludeDataProviderIds
      excludeMowasRegionalKeys: $excludeMowasRegionalKeys
      categoryId: $categoryId
      categoryIds: $categoryIds
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
  query NewsItems(
    $limit: Int
    $offset: Int
    $dataProvider: String
    $dataProviderId: ID
    $dateRange: [String]
    $excludeDataProviderIds: [ID]
    $excludeMowasRegionalKeys: [String]
    $categoryId: ID
    $categoryIds: [ID!]
  ) {
    newsItems(
      limit: $limit
      skip: $offset
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
      dateRange: $dateRange
      excludeDataProviderIds: $excludeDataProviderIds
      excludeMowasRegionalKeys: $excludeMowasRegionalKeys
      categoryId: $categoryId
      categoryIds: $categoryIds
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
    dataProviders: newsItemsDataProviders(categoryId: $categoryId, categoryIds: $categoryIds) {
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
        dataType
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
