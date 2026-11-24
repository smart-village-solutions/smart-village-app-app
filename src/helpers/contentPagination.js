import uniqBy from 'lodash/uniqBy';

import { visibleContent } from './contentVisibility';

const rowsFor = (data, query) => (Array.isArray(data?.[query]) ? data[query] : []);

// Keep raw Apollo pages intact; only skip ahead when a page adds no visible rows.
export const createContentPagination = ({
  fetchMore,
  getVisibleItems,
  query,
  queryDocument,
  variables,
  pageSize
}) => {
  let pending;
  let generation = 0;
  let exhaustedAt;
  let automaticAttemptAt;
  let nextOffset;
  const isPaginated = Number.isFinite(pageSize) && pageSize > 0;
  const emptyResult = () => ({ data: { [query]: [] } });
  const hasDisplayedItems = (rows) => (getVisibleItems ? getVisibleItems(rows) : rows).length > 0;

  const reset = () => {
    generation += 1;
    pending = undefined;
    exhaustedAt = undefined;
    automaticAttemptAt = undefined;
    nextOffset = undefined;
  };

  const shouldLoadMore = (data) => {
    const rows = rowsFor(data, query);
    const eligible = visibleContent(rows);
    return (
      !!queryDocument &&
      isPaginated &&
      rows.length > 0 &&
      rows.length !== exhaustedAt &&
      rows.length !== automaticAttemptAt &&
      eligible !== rows &&
      !hasDisplayedItems(eligible)
    );
  };

  const loadMore = (data, automatic = false) => {
    const rows = rowsFor(data, query);
    if (automatic) automaticAttemptAt = rows.length;
    if (pending) return pending;
    if (rows.length === exhaustedAt) return Promise.resolve(emptyResult());

    const requestGeneration = generation;
    let offset = Math.max(nextOffset ?? 0, rows.length);
    let cachedCount = rows.length;
    const seen = new Set(rows.map((row) => row?.id));
    let versionFiltered = visibleContent(rows) !== rows;

    const run = async () => {
      while (requestGeneration === generation) {
        const result = await fetchMore({
          query: queryDocument,
          variables: { ...variables, offset },
          updateQuery: (previous, { fetchMoreResult }) => {
            if (requestGeneration !== generation) return previous;
            const incoming = rowsFor(fetchMoreResult, query);
            if (!incoming.length) return previous;
            const merged = uniqBy([...rowsFor(previous, query), ...incoming], 'id');
            cachedCount = merged.length;
            return { ...previous, [query]: merged };
          }
        });
        if (requestGeneration !== generation) return result;
        const page = rowsFor(result?.data, query);
        const hasNewRows = page.some((row) => !seen.has(row?.id));
        if (!page.length || !hasNewRows) {
          exhaustedAt = cachedCount;
          return result;
        }
        nextOffset = offset + page.length;
        const eligible = visibleContent(page);
        versionFiltered = versionFiltered || eligible !== page;
        // Without version filtering, keep the existing one-page request behavior.
        if (
          !isPaginated ||
          !versionFiltered ||
          hasDisplayedItems(eligible.filter((row) => !seen.has(row?.id)))
        )
          return result;
        page.forEach((row) => seen.add(row?.id));
        offset = nextOffset;
      }
      return emptyResult();
    };

    const request = run().finally(() => {
      if (pending === request) pending = undefined;
    });
    pending = request;
    return request;
  };

  return { loadMore, reset, shouldLoadMore };
};
