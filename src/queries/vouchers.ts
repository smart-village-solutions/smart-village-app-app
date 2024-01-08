import gql from 'graphql-tag';

import { VoucherLogin } from '../types';
import { namespace, secrets } from '../config';

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

export const logIn = async ({ key, secret }: VoucherLogin) => {
  const fetchObj = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ member: { key, secret } })
  };

  return (await fetch(`${secrets[namespace].serverUrl}/members/sign_in.json`, fetchObj)).json();
};
