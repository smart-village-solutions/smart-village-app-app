import gql from 'graphql-tag';

export const WASTE_ADDRESSES = gql`
  query WasteAddresses($search: String) {
    wasteAddresses(search: $search) {
      id
      street
      city
      zip
    }
  }
`;

export const WASTE_STREET = gql`
  query WasteAddresses($ids: [ID]) {
    wasteAddresses(ids: $ids) {
      id
      street
      city
      zip
      wasteLocationTypes {
        wasteType
        id
        pickUpTimes {
          note
          pickupDate
        }
      }
    }
  }
`;
