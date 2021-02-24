import gql from 'graphql-tag';

export const GET_CROSS_DATA = gql`
  query CrossData(
    $limit: Int
    $orderEventRecords: EventRecordsOrder
    $orderNewsItems: NewsItemsOrder
    $orderPointsOfInterest: PointsOfInterestOrder
    $orderTours: ToursOrder
    $dataProviderId: ID
  ) {
    eventRecords(limit: $limit, order: $orderEventRecords, dataProviderId: $dataProviderId) {
      id
      category {
        id
        name
      }
      dataProvider {
        id
        name
      }
      listDate
      title
      mediaContents {
        id
        contentType
        captionText
        copyright
        sourceUrl {
          url
        }
      }
      addresses {
        id
        city
        street
        zip
        kind
        addition
      }
    }
    newsItems(limit: $limit, order: $orderNewsItems, dataProviderId: $dataProviderId) {
      id
      categories {
        id
        name
      }
      dataProvider {
        id
        name
      }
      publishedAt
      title
      contentBlocks {
        id
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
    }
    pointsOfInterest(
      limit: $limit
      order: $orderPointsOfInterest
      dataProviderId: $dataProviderId
    ) {
      id
      category {
        id
        name
      }
      dataProvider {
        id
        name
      }
      name
      mediaContents {
        id
        contentType
        captionText
        copyright
        sourceUrl {
          url
        }
      }
      addresses {
        id
        city
        street
        zip
        kind
        addition
      }
    }
    tours(limit: $limit, order: $orderTours, dataProviderId: $dataProviderId) {
      id
      category {
        id
        name
      }
      name
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
  }
`;
