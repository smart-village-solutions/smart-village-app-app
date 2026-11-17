import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useContentPagination } from '../../src/hooks/contentPagination';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '5.0.0',
  nativeBuildVersion: '1573'
}));
type Row = { id: string; payload: Record<string, unknown> };
type Data = { newsItems: Row[] };
type FetchOptions = {
  variables: { offset: number };
  updateQuery: (previous: Data, result: { fetchMoreResult: Data }) => Data;
};
const hidden = (id: string): Row => ({ id, payload: { minVersion: '6.0.0' } });
const normal = (id: string): Row => ({ id, payload: {} });
const setup = (initial: Row[], pages: Row[][] = []) => {
  const data = { newsItems: initial };
  let cache = data;
  let index = 0;
  const fetchMore = jest.fn(async (options: FetchOptions) => {
    const result = { data: { newsItems: pages[index++] || [] } };
    cache = options.updateQuery(cache, { fetchMoreResult: result.data });
    return result;
  });
  const props = {
    data,
    fetchMore,
    refetch: jest.fn(async () => ({ data })),
    isConnected: true,
    loading: false,
    pageSize: 2,
    query: 'newsItems',
    queryDocument: 'news-query',
    variables: { limit: 2, categoryId: 'existing' }
  };
  return { props, cache: () => cache };
};

it('loads consecutive hidden pages automatically without waiting for list end-reached events', async () => {
  const test = setup([hidden('1'), hidden('2')], [[hidden('3'), hidden('4')], [normal('5')]]);
  renderHook((props) => useContentPagination(props), { initialProps: test.props });
  await waitFor(() => expect(test.cache().newsItems).toHaveLength(5));
  expect(test.props.fetchMore.mock.calls.map(([options]) => options.variables.offset)).toEqual([
    2, 4
  ]);
  expect(test.props.refetch).not.toHaveBeenCalled();
});

it('preserves unrestricted requests and keeps the focus-refetch callback stable across filters', async () => {
  const test = setup([normal('1')]);
  const hook = renderHook((props) => useContentPagination(props), { initialProps: test.props });
  const first = hook.result.current.refetchVisible;
  hook.rerender({ ...test.props, variables: { limit: 2, categoryId: 'another' } });
  expect(hook.result.current.refetchVisible).toBe(first);
  expect(test.props.fetchMore).not.toHaveBeenCalled();
  expect(test.props.refetch).not.toHaveBeenCalled();
  await act(async () => {
    await hook.result.current.refetchVisible();
  });
  expect(test.props.refetch).toHaveBeenCalledTimes(1);
  expect(test.props.fetchMore).not.toHaveBeenCalled();
});

it('continues after refetch even when Apollo returns the identical cached data object', async () => {
  const test = setup([hidden('1'), hidden('2')], [[], [normal('3')]]);
  const hook = renderHook((props) => useContentPagination(props), { initialProps: test.props });
  await waitFor(() => expect(test.props.fetchMore).toHaveBeenCalledTimes(1));
  await act(async () => {
    await hook.result.current.refetchVisible();
  });
  expect(test.props.fetchMore).toHaveBeenCalledTimes(2);
  expect(test.cache().newsItems.map(({ id }) => id)).toEqual(['1', '2', '3']);
});

it('does not restart pagination when a refetch resolves after unmount', async () => {
  const test = setup([normal('1')]);
  let complete!: (result: { data: Data }) => void;
  test.props.refetch.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        complete = resolve;
      })
  );
  const hook = renderHook((props) => useContentPagination(props), { initialProps: test.props });
  let request!: Promise<unknown>;
  act(() => {
    request = hook.result.current.refetchVisible();
  });
  hook.unmount();
  await act(async () => {
    complete({ data: { newsItems: [hidden('1'), hidden('2')] } });
    await request;
  });
  expect(test.props.fetchMore).not.toHaveBeenCalled();
});

it('invalidates pending pages when the effective list predicate changes', async () => {
  const test = setup([hidden('1'), hidden('2')], [[normal('3')]]);
  let finishOldPage!: () => void;
  test.props.fetchMore.mockImplementationOnce(
    (options) =>
      new Promise((resolve) => {
        finishOldPage = () => {
          const response = { data: { newsItems: [hidden('stale')] } };
          expect(options.updateQuery(test.cache(), { fetchMoreResult: response.data })).toBe(
            test.cache()
          );
          resolve(response);
        };
      })
  );
  const initialProps = { ...test.props, getVisibleItems: (rows: Row[]) => rows };
  const hook = renderHook((props) => useContentPagination(props), { initialProps });
  const focusRefetch = hook.result.current.refetchVisible;
  hook.rerender({
    ...test.props,
    getVisibleItems: (rows: Row[]) => rows.filter(({ id }) => id !== 'excluded')
  });
  await waitFor(() => expect(test.cache().newsItems).toHaveLength(3));
  await act(async () => {
    finishOldPage();
  });
  expect(hook.result.current.refetchVisible).toBe(focusRefetch);
  expect(test.cache().newsItems.map(({ id }) => id)).toEqual(['1', '2', '3']);
  expect(test.props.fetchMore).toHaveBeenCalledTimes(2);
});
