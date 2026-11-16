/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { LocationOverview } from '../../src/components/map/LocationOverview';
import { parseListItemsFromQuery } from '../../src/helpers';

let mockActiveVariables;
const mockUnmounts = [];

jest.mock('react-apollo', () => ({
  useQuery: (query) =>
    query === 'pointsOfInterest'
      ? { data: { pointsOfInterest: [] }, variables: mockActiveVariables }
      : { data: { pointOfInterest: { id: 'poi' } } }
}));
jest.mock('../../src/NetworkProvider', () => ({
  NetworkContext: require('react').createContext({ isConnected: false })
}));
jest.mock('../../src/OrientationProvider', () => ({
  OrientationContext: require('react').createContext({ orientation: 'portrait' })
}));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: require('react').createContext({ globalSettings: {} })
}));
jest.mock('react-native-safe-area-context', () => ({ useSafeAreaInsets: () => ({}) }));
jest.mock('../../src/config', () => ({
  Icon: {},
  consts: { MAP: { DEFAULT_PIN: 'pin' } },
  device: { height: 800 },
  normalize: (x) => x
}));
jest.mock('../../src/helpers', () => ({
  graphqlFetchPolicy: () => 'cache-first',
  parseListItemsFromQuery: jest.fn(() => [{ picture: { url: 'image' } }])
}));
jest.mock('../../src/hooks', () => ({ useLocationSettings: () => ({}) }));
jest.mock('../../src/hooks/useTheme', () => ({ useTheme: () => ({ colors: {} }) }));
jest.mock('../../src/hooks/useThemeStyles', () => ({ useThemeStyles: () => ({}) }));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { POINTS_OF_INTEREST: 'pointsOfInterest', POINT_OF_INTEREST: 'pointOfInterest' },
  getQuery: (x) => x
}));
jest.mock('../../src/components/LoadingSpinner', () => ({ LoadingSpinner: () => null }));
jest.mock('../../src/components/TextListItem', () => ({ TextListItem: () => null }));
jest.mock('../../src/components/screens/AvailableVehicles', () => ({}));
jest.mock('../../src/components/map/ChipFilter', () => ({ ChipFilter: () => null }));
jest.mock('../../src/components/map/MapLibre', () => ({ MapLibre: () => null }));

afterEach(() => {
  act(() => mockUnmounts.splice(0).forEach((tree) => tree.unmount()));
  jest.clearAllMocks();
});

it('passes the current Apollo category filter after a chip refetch, rather than the initial route filter', () => {
  const initialVariables = { categoryIds: ['A', 'B'] };
  mockActiveVariables = initialVariables;
  let tree;
  act(() => {
    tree = renderer.create(
      <LocationOverview queryVariables={initialVariables} route={{ params: {} }} />
    );
  });
  mockUnmounts.push(tree);
  expect(parseListItemsFromQuery.mock.calls.at(-1)[3].queryVariables).toEqual(initialVariables);

  mockActiveVariables = { categoryIds: ['A'], limit: undefined };
  act(() => {
    tree.update(<LocationOverview queryVariables={initialVariables} route={{ params: {} }} />);
  });
  expect(parseListItemsFromQuery.mock.calls.at(-1)[3].queryVariables).toEqual(mockActiveVariables);
  expect(initialVariables.categoryIds).toEqual(['A', 'B']);
});
