import { visibleContent } from './contentVisibility';

const occurrenceKey = (row) => JSON.stringify([row?.id, row?.listDate, row?.date?.id]);

const rowsFor = (data, query) => (Array.isArray(data?.[query]) ? data[query] : []);

// A React Query page can span several server pages when version restrictions hide all rows.
// Retain every raw record and advance by server rows, independently of presentation filters.
export const fetchVisibleContentPage = async ({
  fetchPage,
  query,
  offset = 0,
  pageSize,
  getVisibleItems = (rows) => rows,
  signal
}) => {
  let result = await fetchPage(offset);
  let rows = rowsFor(result, query);
  let page = rows;
  let eligible = visibleContent(page);
  const versionFiltered = eligible !== page;
  const seen = new Set(page.map(occurrenceKey));

  while (
    Number.isFinite(pageSize) &&
    pageSize > 0 &&
    page.length >= pageSize &&
    versionFiltered &&
    !getVisibleItems(eligible).length &&
    !signal?.aborted
  ) {
    const incoming = await fetchPage(offset + rows.length);
    page = rowsFor(incoming, query);
    const newRows = page.filter((row) => !seen.has(occurrenceKey(row)));
    rows = [...rows, ...page];
    result = { ...result, [query]: rows, __contentPageSize: page.length };
    if (!newRows.length) return { ...result, __contentPageSize: 0 };
    eligible = visibleContent(newRows);
    page.forEach((row) => seen.add(occurrenceKey(row)));
  }

  return result;
};

export const getNextContentPageOffset = (lastPage, allPages, query, pageSize) => {
  const lastSize = lastPage?.__contentPageSize ?? rowsFor(lastPage, query).length;
  if (lastSize < pageSize) return undefined;
  return allPages.reduce((offset, page) => offset + rowsFor(page, query).length, 0);
};
