import { renderHook, waitFor } from '@testing-library/react-native';

import { createContentPagination } from '../../src/helpers/contentPagination';
import { parseListItemsFromQuery } from '../../src/helpers/parser/listItemParser';
import { useContentPagination } from '../../src/hooks/contentPagination';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '5.0.0',
  nativeBuildVersion: '1573'
}));
jest.mock('../../src/config', () => ({
  consts: {
    ROOT_ROUTE_NAMES: {
      JOBS: 'Jobs',
      COMMERCIALS: 'Offers',
      DEADLINES: 'Deadlines',
      NOTICEBOARD: 'Noticeboard'
    }
  },
  texts: {
    job: { job: 'Job' },
    commercial: { commercial: 'Offer' },
    noticeboard: { noticeboard: 'Noticeboard' }
  }
}));
jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    GENERIC_ITEMS: 'genericItems',
    GENERIC_ITEM: 'genericItem',
    CONSUL: {},
    SUE: {},
    PROFILE: {},
    VOLUNTEER: {}
  }
}));
jest.mock('../../src/types', () => ({
  GenericType: {
    Job: 'Job',
    Commercial: 'Offer',
    Deadline: 'Deadline',
    Noticeboard: 'Noticeboard'
  },
  ScreenName: { Detail: 'Detail' }
}));
jest.mock('../../src/helpers/imageHelper', () => ({ mainImageOfMediaContents: () => '' }));
jest.mock('../../src/helpers/shareHelper', () => ({ shareMessage: () => '' }));
jest.mock('../../src/helpers/parser/consulParser', () => ({}));
jest.mock('../../src/helpers/parser/sueParser', () => ({}));
jest.mock('../../src/helpers/parser/volunteerParser', () => ({}));

type Row = {
  id: string;
  title: string;
  genericType: string;
  payload: Record<string, unknown>;
  publicationDate: string;
  dates: { dateEnd: string }[];
};
const record = (id: string, overrides: Partial<Row> = {}): Row => ({
  id,
  title: id,
  genericType: 'Job',
  payload: {},
  publicationDate: '2030-05-10',
  dates: [{ dateEnd: '2030-05-10' }],
  ...overrides
});
const restricted = (id: string) => record(id, { payload: { minVersion: '6.0.0' } });
const expired = (id: string) => record(id, { dates: [{ dateEnd: '2030-05-09' }] });
const unpublished = (id: string) => record(id, { publicationDate: '2030-05-11' });

const setup = (initial: Row[], pages: Row[][], genericType = 'Job') => {
  const data = { genericItems: initial };
  let cache = data;
  let page = 0;
  const variables = { limit: 2, genericType };
  const getVisibleItems = (rows: Row[]) =>
    parseListItemsFromQuery('genericItems', { genericItems: rows }, '', {
      queryVariables: variables,
      withDate: false
    });
  const fetchMore = jest.fn(async (options) => {
    const result = { data: { genericItems: pages[page++] || [] } };
    cache = options.updateQuery(cache, { fetchMoreResult: result.data });
    return result;
  });
  const options = {
    fetchMore,
    getVisibleItems,
    query: 'genericItems',
    queryDocument: 'original-query',
    variables,
    pageSize: 2
  };
  return {
    data,
    cache: () => cache,
    fetchMore,
    getVisibleItems,
    options,
    pagination: createContentPagination(options)
  };
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date('2030-05-10T12:00:00Z'));
});
afterEach(() => jest.useRealTimers());

it.each(['Job', 'Offer', 'Deadline', 'Noticeboard'])(
  'continues past expired and unpublished %s pages with the actual list parser',
  async (genericType) => {
    const asType = (row: Row) => ({ ...row, genericType });
    const initial = [restricted('1'), restricted('2')].map(asType);
    const pages = [
      [expired('3'), restricted('4')],
      [unpublished('5'), restricted('6')],
      [record('7')]
    ].map((rows) => rows.map(asType));
    const test = setup(initial, pages, genericType);
    expect(test.pagination.shouldLoadMore(test.data)).toBe(true);
    await test.pagination.loadMore(test.data, true);
    expect(test.fetchMore.mock.calls.map(([options]) => options.variables.offset)).toEqual([
      2, 4, 6
    ]);
    expect(
      test.getVisibleItems(test.cache().genericItems).map(({ id }: { id: string }) => id)
    ).toEqual(['7']);
    expect(test.cache().genericItems).toHaveLength(7);
    expect(test.data.genericItems).toEqual(initial);
  }
);

it('automatically loads a mixed initial page whose only version-eligible record has expired', async () => {
  const test = setup(
    [restricted('1'), expired('2')],
    [[unpublished('3'), restricted('4')], [record('5')]]
  );
  expect(test.pagination.shouldLoadMore(test.data)).toBe(true);
  const refetch = jest.fn(async () => ({ data: test.data }));
  renderHook(() =>
    useContentPagination({
      ...test.options,
      data: test.data,
      refetch,
      isConnected: true,
      loading: false
    })
  );
  await waitFor(() => expect(test.cache().genericItems).toHaveLength(5));
  expect(test.fetchMore).toHaveBeenCalledTimes(2);
  expect(
    test.getVisibleItems(test.cache().genericItems).map(({ id }: { id: string }) => id)
  ).toEqual(['5']);
  expect(refetch).not.toHaveBeenCalled();
});

it('starts combined recovery when version filtering first appears in a subsequent page', async () => {
  const test = setup(
    [record('1')],
    [[expired('2'), restricted('3')], [unpublished('4')], [record('5')]]
  );
  expect(test.pagination.shouldLoadMore(test.data)).toBe(false);
  await test.pagination.loadMore(test.data);
  expect(test.fetchMore).toHaveBeenCalledTimes(3);
  expect(
    test.getVisibleItems(test.cache().genericItems).map(({ id }: { id: string }) => id)
  ).toEqual(['1', '5']);
});

it('stops at EOF without removing restricted or date-filtered cache records', async () => {
  const test = setup([restricted('1'), expired('2')], [[unpublished('3')], []]);
  await test.pagination.loadMore(test.data, true);
  expect(test.fetchMore).toHaveBeenCalledTimes(2);
  expect(test.getVisibleItems(test.cache().genericItems)).toEqual([]);
  expect(test.cache().genericItems).toHaveLength(3);
  expect(test.pagination.shouldLoadMore(test.cache())).toBe(false);
});

it.each([{}, { minVersion: '5.0.0', minBuild: 1573 }])(
  'preserves one-page legacy requests when requirements hide no records: %p',
  async (payload) => {
    const test = setup([expired('1')], [[unpublished('2')], [record('3')]]);
    test.data.genericItems[0].payload = payload;
    expect(test.pagination.shouldLoadMore(test.data)).toBe(false);
    await test.pagination.loadMore(test.data);
    expect(test.fetchMore).toHaveBeenCalledTimes(1);
    expect(test.fetchMore.mock.calls[0][0].variables).toEqual({
      limit: 2,
      genericType: 'Job',
      offset: 1
    });
  }
);
