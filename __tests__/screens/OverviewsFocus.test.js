import React from 'react';
import renderer, { act } from 'react-test-renderer';

import { ListComponent } from '../../src/components/ListComponent';
import { Overviews } from '../../src/components/screens/Overviews';
import { NetworkContext } from '../../src/NetworkProvider';
import { QUERY_TYPES } from '../../src/queries';

let mockFocus;
let mockData;
const mockRefetch = jest.fn();

jest.mock('expo-router/react-navigation', () => ({
  ...jest.requireActual('expo-router/react-navigation'),
  useFocusEffect: (callback) => {
    mockFocus = callback;
  }
}));
jest.mock('react-apollo', () => ({
  ...jest.requireActual('react-apollo'),
  useQuery: () => ({ data: mockData, loading: false, refetch: mockRefetch })
}));
jest.mock('../../src/hooks', () => ({
  useLastKnownPosition: () => ({}),
  useLocationSettings: () => ({ locationSettings: {} }),
  useOpenWebScreen: jest.fn(),
  usePermanentFilter: () => ({}),
  usePosition: () => ({}),
  useStaticContent: () => ({}),
  useSystemPermission: jest.fn()
}));
jest.mock('../../src/helpers', () => ({
  PARTICIPATION_PROJECT_DEFAULT_STATUSES: [],
  filterTypesHelper: () => [],
  graphqlFetchPolicy: () => 'network-only',
  normalizeStyleValues: () => ({}),
  parseListItemsFromQuery: (query, data) => data[query],
  removeLastListItemDivider: (items) => items
}));
jest.mock('../../src/components/CategoryList', () => ({ CategoryList: () => null }));
jest.mock('../../src/components/map/LocationOverview', () => ({ LocationOverview: () => null }));
jest.mock('../../src/components/ListComponent', () => ({ ListComponent: () => null }));
jest.mock('../../src/components/filter', () => ({ Filter: () => null }));

it.each([QUERY_TYPES.NEWS_ITEMS, QUERY_TYPES.TOURS])(
  'keeps loaded %s pages on focus and still allows manual refresh',
  async (query) => {
    mockRefetch.mockClear();
    mockData = {
      [query]: Array.from({ length: 40 }, (_, i) => ({
        id: String(i + 1),
        title: `News ${i + 1}`
      }))
    };
    let tree;
    try {
      await act(async () => {
        tree = renderer.create(
          <NetworkContext.Provider value={{ isConnected: true, isMainserverUp: true }}>
            <Overviews
              navigation={{}}
              route={{ params: { query, queryVariables: { limit: 20 } } }}
            />
          </NetworkContext.Provider>
        );
      });

      await act(async () => mockFocus());
      expect(mockRefetch).not.toHaveBeenCalled();
      expect(tree.root.findByType(ListComponent).props.data).toHaveLength(40);

      await act(async () =>
        tree.root.findByType(ListComponent).props.refreshControl.props.onRefresh()
      );
      expect(mockRefetch).toHaveBeenCalledTimes(1);
    } finally {
      if (tree) await act(async () => tree.unmount());
    }
  }
);
