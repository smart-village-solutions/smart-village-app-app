import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';

import { GET_POINT_OF_INTEREST_MAP_MARKERS } from '../../../src/queries/pointsOfInterest';

const SEED_POI_QUERY = gql`
  query SeedPointOfInterestForMap {
    pointOfInterest(id: "18887") {
      id
      category {
        id
        iconName
      }
      addresses {
        id
        geoLocation {
          id
          latitude
          longitude
        }
      }
    }
  }
`;

it('writes related POIs into a cache that already contains the opened POI', () => {
  const cache = new InMemoryCache();
  const category = { __typename: 'Category', id: '7', iconName: 'defaultPin' };
  const addresses = [
    {
      __typename: 'Address',
      id: 'address-1',
      geoLocation: {
        __typename: 'GeoLocation',
        id: 'location-1',
        latitude: 52.1641,
        longitude: 12.6068
      }
    }
  ];

  cache.writeQuery({
    query: SEED_POI_QUERY,
    data: {
      pointOfInterest: { __typename: 'PointOfInterest', id: '18887', category, addresses }
    }
  });

  expect(() =>
    cache.writeQuery({
      query: GET_POINT_OF_INTEREST_MAP_MARKERS,
      variables: { category: 'Hotels, Pensionen etc.' },
      data: {
        pointsOfInterest: [
          {
            __typename: 'PointOfInterest',
            id: '18887',
            name: 'Hotel Springbach-Mühle',
            visible: true,
            payload: null,
            category,
            addresses
          }
        ]
      }
    })
  ).not.toThrow();

  expect(
    cache.readQuery({
      query: GET_POINT_OF_INTEREST_MAP_MARKERS,
      variables: { category: 'Hotels, Pensionen etc.' }
    }).pointsOfInterest
  ).toHaveLength(1);
});
