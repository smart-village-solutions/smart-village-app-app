import gql from 'graphql-tag';

export const GET_GENERIC_ITEMS = gql`
  query GenericItems(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: GenericItemOrder
    $dataProvider: String
    $categoryId: ID
    $genericType: String
    $currentMember: Boolean
    $memberId: ID
  ) {
    genericItems(
      ids: $ids
      limit: $limit
      skip: $offset
      order: $order
      dataProvider: $dataProvider
      categoryId: $categoryId
      genericType: $genericType
      currentMember: $currentMember
      memberId: $memberId
    ) {
      id
      createdAt
      updatedAt
      description
      genericType
      title
      teaser
      externalId
      visible
      categories {
        id
        name
      }
      addresses {
        id
        city
        street
        zip
        kind
        addition
        geoLocation {
          id
          latitude
          longitude
        }
      }
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
        title
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
      dataProvider {
        id
        logo {
          id
          url
        }
        name
        dataType
        notice
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
        dateStart
        dateFrom: dateStart
        dateTo: dateEnd
        timeDescription
        timeEnd
        timeStart
        timeFrom: timeStart
        timeTo: timeEnd
        weekday
      }
      locations {
        id
        name
        geoLocation {
          id
          latitude
          longitude
        }
      }
      openingHours {
        id
        dateFrom
        dateTo
        description
        open
        timeFrom
        timeTo
        useYear
        weekday
      }
      publicationDate
      webUrls {
        id
        url
        description
      }
      payload
      settings {
        displayOnlySummary
        onlySummaryLinkText
      }
      memberId
    }
  }
`;

export const GET_GENERIC_ITEM = gql`
  query GenericItem($id: ID!) {
    genericItem(id: $id) {
      id
      categories {
        id
        name
      }
      addresses {
        id
        city
        street
        zip
        kind
        addition
        geoLocation {
          id
          latitude
          longitude
        }
      }
      createdAt
      updatedAt
      description
      genericType
      title
      teaser
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
        title
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
      dataProvider {
        id
        logo {
          id
          url
        }
        name
        dataType
        notice
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
        dateStart
        dateFrom: dateStart
        dateTo: dateEnd
        timeDescription
        timeEnd
        timeStart
        timeFrom: timeStart
        timeTo: timeEnd
        weekday
      }
      locations {
        id
        name
        geoLocation {
          id
          latitude
          longitude
        }
      }
      openingHours {
        id
        dateFrom
        dateTo
        description
        open
        timeFrom
        timeTo
        useYear
        weekday
      }
      publicationDate
      webUrls {
        id
        url
        description
      }
      payload
      settings {
        displayOnlySummary
        onlySummaryLinkText
      }
      priceInformations {
        description
      }
      memberId
    }
  }
`;

export const CREATE_GENERIC_ITEM = gql`
  mutation createGenericItem(
    $addresses: [AddressInput!]
    $categoryName: String
    $contacts: [ContactInput!]
    $contentBlocks: [ContentBlockInput!]
    $dates: [DateInput!]
    $forceCreate: Boolean = false
    $genericType: String
    $id: ID
    $mediaContents: [MediaContentInput!]
    $payload: JSON
    $priceInformations: [PriceInput!]
    $publishedAt: String
    $title: String
  ) {
    createGenericItem(
      addresses: $addresses
      categoryName: $categoryName
      contacts: $contacts
      contentBlocks: $contentBlocks
      dates: $dates
      forceCreate: $forceCreate
      genericType: $genericType
      id: $id
      mediaContents: $mediaContents
      payload: $payload
      priceInformations: $priceInformations
      publishedAt: $publishedAt
      title: $title
    ) {
      id
    }
  }
`;

export const CREATE_GENERIC_ITEM_MESSAGE = gql`
  mutation createGenericItemMessage(
    $genericItemId: ID!
    $name: String!
    $email: String!
    $phoneNumber: String
    $message: String!
    $termsOfService: Boolean!
  ) {
    createGenericItemMessage(
      genericItemId: $genericItemId
      name: $name
      email: $email
      phoneNumber: $phoneNumber
      message: $message
      termsOfService: $termsOfService
    ) {
      statusCode
    }
  }
`;

export const DELETE_GENERIC_ITEM = gql`
  mutation deleteGenericItem($id: ID!) {
    changeVisibility(id: $id, recordType: "GenericItem", visible: false) {
      id
      status
      statusCode
    }
  }
`;
