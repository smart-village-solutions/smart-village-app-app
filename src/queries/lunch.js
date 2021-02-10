import gql from 'graphql-tag';

export const GET_LUNCHES = gql`
  query Lunches($ids: [ID], $limit: Int, $offset: Int, $order: LunchesOrder, $dateRange: [String]) {
    lunches(ids: $ids, limit: $limit, skip: $offset, order: $order, dateRange: $dateRange) {
      id
      text
      lunchOffers {
        name
        price
      }
      pointOfInterest {
        id
        addresses {
          kind
          city
          street
          zip
        }
        contact {
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
          contentType
          sourceUrl {
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
