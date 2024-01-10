import gql from 'graphql-tag';

import { namespace, secrets } from '../config';
import { VoucherLogin } from '../types';

// TODO: memberId: 1 will be updated later. 1 will be replaced by the id of the logged in user
export const GET_VOUCHERS = gql`
  query GenericItems(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: GenericItemOrder
    $dataProvider: String
    $categoryId: ID
  ) {
    genericItems(
      ids: $ids
      limit: $limit
      skip: $offset
      order: $order
      dataProvider: $dataProvider
      categoryId: $categoryId
      genericType: "Voucher"
    ) {
      id
      updatedAt
      createdAt
      publishedAt
      genericType
      id
      title
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
        availableQuantityForMember(memberId: 1)
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
    }
  }
`;

export const GET_VOUCHER = gql`
  query GenericItem($id: ID!) {
    genericItem(id: $id) {
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
  query GenericItems {
    genericItems(genericType: "Voucher") {
      categories {
        name
        id
      }
    }
  }
`;

export const REDEEM_QUOTA_OF_VOUCHER = gql`
  mutation redeemQuotaOfVoucher(
    $deviceToken: String!
    $memberId: ID!
    $quantity: Int!
    $voucherId: ID!
  ) {
    redeemQuotaOfVoucher(
      deviceToken: $deviceToken
      memberId: $memberId
      quantity: $quantity
      voucherId: $voucherId
    ) {
      id
      status
      statusCode
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