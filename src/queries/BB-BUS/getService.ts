import gql from 'graphql-tag';

export const GET_SERVICE = gql`
  query getService($areaId: ID!, $externalIds: ID!) {
    publicServiceTypes(areaId: $areaId, externalIds: [$externalIds]) {
      id: externalId
      organisationalUnits {
        id: externalId
        name
        addresses {
          ...AddressValues
        }
        communications {
          ...CommunicationValues
        }
        openingHours
        elevator
        wheelchairAccessible
        forms {
          name
          links {
            url
          }
        }
      }
      persons {
        id: externalId
        title
        firstName
        lastName
        department
        room
        position
        addresses {
          ...AddressValues
        }
        communication {
          ...CommunicationValues
        }
      }
      textBlocks {
        type {
          id
          key
          name
          description
        }
        name
        text
        externalLinks {
          name
          url
        }
      }
    }
  }

  fragment AddressValues on Address {
    street
    houseNumber
    zipcode
    city
  }

  fragment CommunicationValues on Communication {
    type {
      id
      key
      name
    }
    value
  }
`;
