import gql from 'graphql-tag';

export const GET_LUNCHES = gql`
  query Lunches($ids: [ID], $limit: Int, $offset: Int, $order: LunchesOrder, $dateRange: [String]) {
    lunches(ids: $ids, limit: $limit, skip: $offset, order: $order, dateRange: $dateRange) {
      id
      text
      lunchOffers {
        id
        name
        price
      }
      pointOfInterest {
        id
        addresses {
          id
          kind
          city
          street
          zip
        }
        contact {
          id
          email
          fax
          phone
          webUrls {
            id
            description
            url
          }
        }
        name
        mediaContents {
          id
          contentType
          sourceUrl {
            id
            url
          }
        }
        webUrls {
          id
          description
          url
        }
      }
      pointOfInterestAttributes
    }
  }
`;
