import gql from 'graphql-tag';

export const GET_GENERIC_ITEMS = gql`
  query GenericItems(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $dataProvider: String
    $categoryId: ID
    $genericType: String
  ) {
    genericItems(
      ids: $ids
      limit: $limit
      skip: $offset
      dataProvider: $dataProvider
      categoryId: $categoryId
      genericType: $genericType
    ) {
      id
      createdAt
      genericType
      title
      externalId
      companies {
        id
        name
        address {
          id
          addition
          street
          zip
          city
          geoLocation {
            id
            latitude
            longitude
          }
        }
        contact {
          id
          firstName
          lastName
          phone
          email
          webUrls {
            id
            url
            description
          }
        }
      }
      contacts {
        id
        firstName
        lastName
        phone
        email
        webUrls {
          id
          url
          description
        }
      }
      contentBlocks {
        id
        body
        mediaContents {
          id
          contentType
          sourceUrl {
            id
            url
          }
          captionText
        }
      }
      mediaContents {
        id
        captionText
        contentType
        copyright
        sourceUrl {
          id
          url
        }
      }
      dates {
        id
        dateEnd
      }
      publicationDate
      payload
    }
  }
`;
