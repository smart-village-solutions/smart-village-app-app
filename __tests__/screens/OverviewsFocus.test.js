import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DeviceEventEmitter } from 'react-native';

import { ListComponent } from '../../src/components/ListComponent';
import { Overviews } from '../../src/components/screens/Overviews';
import { NetworkContext } from '../../src/NetworkProvider';
import { QUERY_TYPES } from '../../src/queries';
import { DETAIL_REFRESH_EVENT } from '../../src/hooks/DetailRefresh';

let mockFocus;
let mockData;
const mockRefetch = jest.fn();
const mockTrees = [];
beforeEach(() => mockRefetch.mockReset());
afterEach(async () => {
  await act(async () => mockTrees.splice(0).forEach((tree) => tree.unmount()));
});

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

const newsScreen = (online = true) => (
  <NetworkContext.Provider value={{ isConnected: online, isMainserverUp: online }}>
    <Overviews
      navigation={{}}
      route={{
        params: { query: QUERY_TYPES.NEWS_ITEMS, queryVariables: { limit: 20, categoryIds: ['a'] } }
      }}
    />
  </NetworkContext.Provider>
);
const renderNews = async (online = true) => {
  mockData = {
    newsItems: Array.from({ length: 40 }, (_, id) => ({ id: String(id), title: `News ${id}` }))
  };
  let tree;
  await act(async () => {
    tree = renderer.create(newsScreen(online));
  });
  mockTrees.push(tree);
  return tree;
};

it('reconciles the loaded filtered news range after a save and keeps unchanged visits cached', async () => {
  mockRefetch.mockResolvedValue({ data: {} });
  const tree = await renderNews();
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenCalledWith({ limit: 40, categoryIds: ['a'] });
  expect(tree.root.findByType(ListComponent).props.data).toHaveLength(40);
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenCalledTimes(1);
  await act(async () => tree.root.findByType(ListComponent).props.refreshControl.props.onRefresh());
  expect(mockRefetch).toHaveBeenLastCalledWith({ limit: 20, categoryIds: ['a'] });
});

it('retains a failed news invalidation for the next focus without discarding loaded rows', async () => {
  const tree = await renderNews();
  mockRefetch
    .mockRejectedValueOnce(new Error('temporary network failure'))
    .mockResolvedValue({ data: {} });
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  expect(tree.root.findByType(ListComponent).props.data).toHaveLength(40);
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenCalledTimes(2);
  expect(mockRefetch).toHaveBeenLastCalledWith({ limit: 40, categoryIds: ['a'] });
});

it('keeps offline invalidations pending until online focus', async () => {
  mockRefetch.mockResolvedValue({ data: {} });
  const tree = await renderNews(false);
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  expect(mockRefetch).not.toHaveBeenCalled();
  await act(async () => tree.update(newsScreen(true)));
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenCalledWith({ limit: 40, categoryIds: ['a'] });
});

it('does not let an older successful refresh undo a newer acknowledged invalidation', async () => {
  await renderNews();
  let finishOld;
  mockRefetch
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishOld = resolve;
        })
    )
    .mockResolvedValue({ data: {} });
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  await act(async () => finishOld({ data: {} }));
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenCalledTimes(2);
});

it('retains the pre-detail range when an awaited news deletion refetch first shrinks the cache', async () => {
  mockRefetch.mockResolvedValue({ data: {} });
  const tree = await renderNews();
  let blur;
  act(() => {
    blur = mockFocus();
  });
  expect(mockRefetch).not.toHaveBeenCalled();
  act(() => blur());
  // NewsItem awaits Apollo's ordinary first-page refetch before onCompleted emits the event.
  mockData = { newsItems: mockData.newsItems.slice(0, 20) };
  await act(async () => tree.update(newsScreen()));
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenLastCalledWith({ limit: 40, categoryIds: ['a'] });
  // An explicit refresh and the next detail visit use the newly visible first-page range.
  await act(async () => tree.root.findByType(ListComponent).props.refreshControl.props.onRefresh());
  act(() => {
    blur = mockFocus();
  });
  act(() => blur());
  act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
  await act(async () => mockFocus());
  expect(mockRefetch).toHaveBeenLastCalledWith({ limit: 20, categoryIds: ['a'] });
});

it.each([false, true])(
  'retains failed deletion reconciliation across blur unless manually reset (%s)',
  async (manualReset) => {
    const tree = await renderNews();
    let blur;
    act(() => {
      blur = mockFocus();
    });
    act(() => blur());
    mockData = { newsItems: mockData.newsItems.slice(0, 20) };
    await act(async () => tree.update(newsScreen()));
    mockRefetch
      .mockRejectedValueOnce(new Error('reconciliation failed'))
      .mockResolvedValue({ data: {} });
    act(() => DeviceEventEmitter.emit(DETAIL_REFRESH_EVENT));
    await act(async () => {
      blur = mockFocus();
    });
    expect(mockRefetch).toHaveBeenLastCalledWith({ limit: 40, categoryIds: ['a'] });
    if (manualReset) {
      await act(async () =>
        tree.root.findByType(ListComponent).props.refreshControl.props.onRefresh()
      );
    }
    act(() => blur());
    await act(async () => mockFocus());
    expect(mockRefetch).toHaveBeenLastCalledWith({
      limit: manualReset ? 20 : 40,
      categoryIds: ['a']
    });
  }
);
