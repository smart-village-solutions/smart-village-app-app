import gql from 'graphql-tag';

export const WASTE_ADDRESSES = gql`
  query {
    wasteAddresses {
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
        listPickUpDates
        pickUpTimes {
          id
          note
          pickupDate
        }
      }
    }
  }
`;
