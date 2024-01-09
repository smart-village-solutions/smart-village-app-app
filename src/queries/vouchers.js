import gql from 'graphql-tag';

// TODO: memberId: 1 will be updated later. 1 will be replaced by the id of the logged in user
export const GET_VOUCHERS = gql`
  query Vouchers($limit: Int, $order: GenericItemOrder) {
    vouchers(limit: $limit, order: $order) {
      id
      title
      categories {
        name
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
        availableQuantityForMember(memberId: 1)
      }
      contentBlocks {
        id
        title
        intro
        body
      }
      dates {
        id
        dateStart
        timeStart
        dateEnd
        timeEnd
      }
    }
  }
`;

export const GET_VOUCHER = gql`
  query Voucher($id: ID!) {
    voucher(id: $id) {
      id
      title
      categories {
        name
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
        availableQuantityForMember(memberId: 1)
      }
      contentBlocks {
        id
        title
        intro
        body
      }
      dates {
        id
        dateStart
        timeStart
        dateEnd
        timeEnd
      }
    }
  }
`;

export const GET_VOUCHERS_CATEGORIES = gql`
  query Vouchers {
    vouchers {
      categories {
        name
        id
      }
    }
  }
`;
