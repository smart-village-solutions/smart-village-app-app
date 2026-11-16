import { act, renderHook } from '@testing-library/react-native';

import { useListPagination } from '../../src/hooks/useListPagination';

describe('list pagination', () => {
  it.each([undefined, {}, { data: undefined }, { data: { items: undefined } }, { isError: true }])(
    'does not interpret an incomplete or failed response as the last page: %p',
    async (response) => {
      const fetchMore = jest.fn().mockResolvedValue(response);
      const { result } = renderHook(() => useListPagination(fetchMore, 'items'));
      await act(async () => result.current.onEndReached());
      expect(result.current.listEndReached).toBe(false);
    }
  );

  it('uses React Query availability instead of interpreting its pages as Apollo data', async () => {
    const fetchMore = jest.fn().mockResolvedValue({ data: { pages: [[]] }, hasNextPage: true });
    const { result } = renderHook(() => useListPagination(fetchMore, 'items'));
    await act(async () => result.current.onEndReached());
    expect(result.current.listEndReached).toBe(false);
    fetchMore.mockResolvedValue({ hasNextPage: false });
    await act(async () => result.current.onEndReached());
    expect(result.current.listEndReached).toBe(true);
  });

  it.each([{ data: { items: [] } }, { data: [] }])(
    'recognizes a successful empty page',
    async (response) => {
      const { result } = renderHook(() =>
        useListPagination(
          jest.fn().mockResolvedValue(response),
          Array.isArray(response.data) ? undefined : 'items'
        )
      );
      await act(async () => result.current.onEndReached());
      expect(result.current.listEndReached).toBe(true);
    }
  );

  it('deduplicates overlapping scrolls and allows retry after rejection', async () => {
    let rejectPage: (error: Error) => void = () => {};
    const fetchMore = jest.fn().mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectPage = reject;
        })
    );
    const { result } = renderHook(() => useListPagination(fetchMore, 'items'));
    await act(async () => {
      const first = result.current.onEndReached();
      await result.current.onEndReached();
      expect(fetchMore).toHaveBeenCalledTimes(1);
      rejectPage(new Error('offline'));
      await first;
    });
    expect(result.current.listEndReached).toBe(false);
    fetchMore.mockResolvedValue({ data: { items: [{ id: 1 }] } });
    await act(async () => result.current.onEndReached());
    expect(fetchMore).toHaveBeenCalledTimes(2);
    expect(result.current.listEndReached).toBe(false);
  });

  it('retains the last-page state for equivalent variables in a new object/key order', async () => {
    const fetchMore = jest.fn().mockResolvedValue({ hasNextPage: false });
    const { result, rerender } = renderHook(
      ({ variables }) => useListPagination(fetchMore, 'items', variables),
      { initialProps: { variables: { category: 'a', limit: 20 } } }
    );
    await act(async () => result.current.onEndReached());
    rerender({ variables: { limit: 20, category: 'a' } });
    expect(result.current.listEndReached).toBe(true);
  });

  it('resets completion when changing filters away and back without fetching the intermediate scope', async () => {
    const fetchMore = jest.fn().mockResolvedValue({ hasNextPage: false });
    const { result, rerender } = renderHook(
      ({ category }) => useListPagination(fetchMore, 'items', { category }),
      { initialProps: { category: 'a' } }
    );
    await act(async () => result.current.onEndReached());
    rerender({ category: 'b' });
    expect(result.current.listEndReached).toBe(false);
    rerender({ category: 'a' });
    expect(result.current.listEndReached).toBe(false);
  });

  it('deduplicates and accepts a pending result across equivalent variable objects', async () => {
    let finish;
    const fetchMore = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        })
    );
    const { result, rerender } = renderHook(
      ({ variables }) => useListPagination(fetchMore, 'items', variables),
      { initialProps: { variables: { category: 'a' } } }
    );
    let first;
    act(() => {
      first = result.current.onEndReached();
    });
    rerender({ variables: { category: 'a' } });
    await act(async () => {
      await result.current.onEndReached();
    });
    expect(fetchMore).toHaveBeenCalledTimes(1);
    await act(async () => {
      finish({ hasNextPage: false });
      await first;
    });
    expect(result.current.listEndReached).toBe(true);
  });

  it('ignores completion of an old query after filters change', async () => {
    let resolvePage: (value: { hasNextPage: boolean }) => void = () => {};
    const fetchMore = jest.fn().mockImplementation(
      () =>
        new Promise((resolve) => {
          resolvePage = resolve;
        })
    );
    const { result, rerender } = renderHook(
      ({ filter }) => useListPagination(fetchMore, 'items', filter),
      { initialProps: { filter: 'old' } }
    );
    let pending: Promise<void>;
    act(() => {
      pending = result.current.onEndReached();
    });
    rerender({ filter: 'new' });
    await act(async () => {
      resolvePage({ hasNextPage: false });
      await pending;
    });
    expect(result.current.listEndReached).toBe(false);
  });
});
