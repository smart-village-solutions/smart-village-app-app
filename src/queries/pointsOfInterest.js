import gql from 'graphql-tag';

export const GET_POINTS_OF_INTEREST = gql`
  query PointsOfInterest(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: PointsOfInterestOrder
    $category: String
    $categoryId: ID
    $categoryIds: [ID]
    $dataProvider: String
    $dataProviderId: ID
    $location: String
  ) {
    pointsOfInterest(
      ids: $ids
      limit: $limit
      skip: $offset
      order: $order
      category: $category
      categoryId: $categoryId
      categoryIds: $categoryIds
      dataProvider: $dataProvider
      dataProviderId: $dataProviderId
      location: $location
    ) {
      id
      name
      category {
        id
        name
        iconName
      }
      description
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
      addresses {
        id
        city
        street
        zip
        kind
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
        fax
        webUrls {
          id
          url
          description
        }
      }
      openingHours {
        id
        weekday
        timeFrom
        timeTo
        open
        dateFrom
        dateTo
        useYear
      }
      vouchers {
        id
      }
      webUrls {
        id
        url
        description
      }
    }
  }
`;

export const GET_POINT_OF_INTEREST = gql`
  query PointOfInterest($id: ID!) {
    pointOfInterest(id: $id) {
      id
      title: name
      payload
      categories {
        id
        name
        iconName
      }
      category {
        id
        name
        iconName
      }
      description
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
      contact {
        id
        firstName
        lastName
        phone
        email
        fax
        webUrls {
          id
          url
          description
        }
      }
      webUrls {
        id
        url
        description
      }
      priceInformations {
        id
        category
        amount
        description
        maxChildrenCount
        maxAdultCount
        groupPrice
      }
      openingHours {
        id
        sortNumber
        weekday
        timeFrom
        timeTo
        open
        dateFrom
        dateTo
        description
        useYear
      }
      operatingCompany {
        id
        name
        address {
          id
          kind
          addition
          street
          zip
          city
        }
        contact {
          id
          firstName
          lastName
          phone
          email
          fax
          webUrls {
            id
            url
            description
          }
        }
      }
      lunches {
        id
      }
      vouchers {
        id
        updatedAt
        createdAt
        publishedAt
        genericType
        title
        subtitle: teaser
        categories {
          name
          id
        }
        discountType {
          originalPrice
          discountedPrice
          discountPercentage
          discountAmount
        }
        quota {
          id
          frequency
          maxQuantity
          maxPerPerson
          availableQuantity
        }
        contentBlocks {
          id
          title
          intro
          body
          updatedAt
          createdAt
        }
        dates {
          id
          dateStart
          timeStart
          dateEnd
          timeEnd
        }
        mediaContents {
          contentType
          sourceUrl {
            url
          }
        }
        payload
      }
    }
  }
`;
