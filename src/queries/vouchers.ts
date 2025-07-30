import gql from 'graphql-tag';

import { namespace, secrets } from '../config';
import { VoucherLogin } from '../types';

export const GET_VOUCHERS = gql`
  query GenericItems(
    $ids: [ID]
    $limit: Int
    $offset: Int
    $order: GenericItemOrder
    $dataProvider: String
    $categoryId: ID
    $memberId: ID
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
        availableQuantityForMember(memberId: $memberId)
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
        id
        contentType
        captionText
        copyright
        sourceUrl {
          id
          url
        }
      }
      pointOfInterest {
        operatingCompany {
          name
        }
      }
      payload
    }
  }
`;

export const GET_VOUCHER = gql`
  query GenericItem($id: ID!, $memberId: ID) {
    genericItem(id: $id) {
      id
      title
      subtitle: teaser
      categories {
        name
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
        availableQuantityForMember(memberId: $memberId)
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
      pointOfInterest {
        name
        payload
        id
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
        vouchers {
          id
        }
      }
      payload
    }
  }
`;

export const GET_VOUCHERS_CATEGORIES = gql`
  query GenericItems($categoryId: ID) {
    genericItems(categoryId: $categoryId, genericType: "Voucher") {
      categories {
        name
        id
      }
    }
  }
`;

export const GET_VOUCHERS_REDEEMED = gql`
  query Vouchers($limit: Int, $offset: Int, $order: GenericItemOrder, $memberId: ID) {
    vouchers(limit: $limit, skip: $offset, order: $order, memberId: $memberId) {
      id
      updatedAt
      createdAt
      publishedAt
      genericType
      id
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
        availableQuantityForMember(memberId: $memberId)
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
`;

export const REDEEM_QUOTA_OF_VOUCHER = gql`
  mutation redeemQuotaOfVoucher(
    $deviceToken: String
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
