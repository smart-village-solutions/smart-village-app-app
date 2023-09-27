import gql from 'graphql-tag';

export const GET_TRAVEL_TIMES = gql`
  query TravelTimes($externalId: ID!, $date: String!, $dataProviderId: ID!) {
    travelTimes(externalId: $externalId, date: $date, dataProviderId: $dataProviderId) {
      departureTime
      route {
        routeShortName
        routeType
      }
      trip {
        tripHeadsign
      }
    }
  }
`;
