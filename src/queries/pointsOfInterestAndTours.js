import gql from 'graphql-tag';

export const GET_POINTS_OF_INTEREST_AND_TOURS = gql`
  query PointsOfInterestAndTours($limit: Int) {
    pointsOfInterest(limit: $limit) {
      id
      name
      category {
        name
      }
      description
      mediaContents {
        contentType
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
    }

    tours(limit: $limit) {
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

export const GET_POINT_OF_INTEREST_AND_TOUR = gql`
  query PointOfInterestAndTour($id: ID!) {
    pointOfInterest(id: $id) {
      id
      title: name
      category {
        name
      }
      description
      mediaContents {
        contentType
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
      prices {
        category
        amount
        description
        maxChildrenCount
        maxAdultCount
        groupPrice
      }
      openingHours {
        sortNumber
        weekday
        timeFrom
        timeTo
        open
        dateFrom
        dateTo
        description
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
