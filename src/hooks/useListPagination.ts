import _isEqual from 'lodash/isEqual';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

type PageResult = {
  data?: Record<string, unknown> | unknown[];
  hasNextPage?: boolean;
  isError?: boolean;
};

const getArrayPageEnd = (result: PageResult, query?: string) => {
  const data = result.data;
  const items = query && data && !Array.isArray(data) ? data[query] : data;
  return Array.isArray(items) ? items.length === 0 : undefined;
};

export const useListPagination = (
  fetchMoreData: (() => Promise<PageResult | undefined>) | undefined,
  query?: string,
  queryVariables?: unknown
) => {
  const [pageState, setPageState] = useState({ query, queryVariables, ended: false });
  if (pageState.query !== query || !_isEqual(pageState.queryVariables, queryVariables)) {
    setPageState({ query, queryVariables, ended: false });
  }
  const listEndReached =
    pageState.query === query &&
    _isEqual(pageState.queryVariables, queryVariables) &&
    pageState.ended;
  const setListEndReached = (ended: boolean) => setPageState({ query, queryVariables, ended });
  const generation = useRef(0);
  const pending = useRef<number | null>(null);

  const scope = useRef({ query, queryVariables });
  useLayoutEffect(() => {
    if (scope.current.query !== query || !_isEqual(scope.current.queryVariables, queryVariables)) {
      generation.current += 1;
      scope.current = { query, queryVariables };
    }
  });
  useEffect(
    () => () => {
      generation.current += 1;
    },
    []
  );

  const onEndReached = async () => {
    const requestGeneration = generation.current;
    if (pending.current === requestGeneration) return;
    if (!fetchMoreData) {
      setListEndReached(true);
      return;
    }

    pending.current = requestGeneration;
    try {
      const result = await fetchMoreData();
      if (generation.current !== requestGeneration || !result || result.isError) return;

      // React Query exposes page availability directly; Apollo returns a keyed array.
      if (typeof result.hasNextPage === 'boolean') {
        setListEndReached(!result.hasNextPage);
        return;
      }

      const ended = getArrayPageEnd(result, query);
      if (ended !== undefined) setListEndReached(ended);
    } catch {
      // Keep pagination retryable. Query owners retain their error state and reporting.
      if (generation.current === requestGeneration) setListEndReached(false);
    } finally {
      if (pending.current === requestGeneration) pending.current = null;
    }
  };

  return { listEndReached, onEndReached };
};
