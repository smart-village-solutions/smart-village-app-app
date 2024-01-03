import gql from 'graphql-tag';

export const GET_VOUCHERS = gql`
  query Vouchers {
    vouchers {
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
