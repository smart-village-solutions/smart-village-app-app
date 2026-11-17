import { useCallback, useEffect, useMemo, useRef } from 'react';

import { createContentPagination } from '../helpers/contentPagination';

export const useContentPagination = ({
  data,
  fetchMore,
  getVisibleItems,
  isConnected,
  loading,
  pageSize,
  query,
  queryDocument,
  refetch,
  variables
}) => {
  const pagination = useMemo(
    () =>
      createContentPagination({
        fetchMore,
        getVisibleItems,
        query,
        queryDocument,
        variables,
        pageSize
      }),
    [fetchMore, getVisibleItems, pageSize, query, queryDocument, variables]
  );
  const paginationRef = useRef(pagination);
  useEffect(() => {
    paginationRef.current = pagination;
    return () => {
      paginationRef.current = undefined;
      pagination.reset();
    };
  }, [pagination]);
  useEffect(() => {
    if (!loading && isConnected && pagination.shouldLoadMore(data)) {
      // Keep cached content on transient failures; explicit refresh can retry.
      pagination.loadMore(data, true).catch(() => {});
    }
  }, [data, isConnected, loading, pagination]);

  // Keep this callback stable across filter changes so focus effects do not refetch twice.
  const refetchVisible = useCallback(async () => {
    const currentPagination = paginationRef.current;
    if (!currentPagination) return;
    currentPagination.reset();
    const result = await refetch();
    if (
      paginationRef.current === currentPagination &&
      currentPagination.shouldLoadMore(result?.data)
    ) {
      await currentPagination.loadMore(result.data, true);
    }
    return result;
  }, [refetch]);
  const fetchMoreData = useCallback(() => pagination.loadMore(data), [data, pagination]);

  return { fetchMoreData, refetchVisible };
};
