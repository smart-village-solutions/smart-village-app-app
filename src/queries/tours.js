import gql from 'graphql-tag';

export const GET_TOURS = gql`
  query Tours($limit: Int, $order: ToursOrder) {
    tours(limit: $limit, order: $order) {
      id
      name
      category {
        name
      }
      description
      mediaContents {
        sourceUrl {
          url
        }
      }
      dataProvider {
        logo {
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
        name
      }
      description
      mediaContents {
        sourceUrl {
          url
        }
      }
      addresses {
        city
        street
        zip
      }
      contact {
        email
        phone
        lastName
      }
      webUrls {
        url
      }
      lengthKm
      dataProvider {
        logo {
          url
        }
        name
      }
      operatingCompany {
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
          firstName
          lastName
          phone
          email
          fax
          webUrls {
            url
          }
        }
      }
    }
  }
`;
