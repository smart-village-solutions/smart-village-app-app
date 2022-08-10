import gql from 'graphql-tag';

export const GET_TOURS = gql`
  query Tours(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: ToursOrder
    $category: String
    $categoryId: ID
    $categoryIds: [ID]
    $dataProvider: String
    $dataProviderId: ID
    $location: String
  ) {
    tours(
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
      dataProvider {
        id
        logo {
          id
          url
        }
        name
      }
    }
  }
`;

export const GET_TOUR = gql`
  query Tour($id: ID!) {
    tour(id: $id) {
      id
      title: name
      category {
        id
        name
      }
      categories {
        id
        name
      }
      tourStops {
        id
        title: name
        description
        location {
          geoLocation {
            latitude
            longitude
          }
        }
        payload
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
        addition
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
      lengthKm
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
    }
  }
`;

export const GET_TOUR_STOPS = gql`
  query Tour($id: ID!) {
    tour(id: $id) {
      tourStops {
        id
        title: name
        description
        location {
          geoLocation {
            latitude
            longitude
          }
        }
        payload
      }
    }
  }
`;
