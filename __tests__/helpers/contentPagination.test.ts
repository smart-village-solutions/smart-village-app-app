import { createContentPagination } from '../../src/helpers/contentPagination';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '5.0.0',
  nativeBuildVersion: '1573'
}));
const hidden = (id: string) => ({ id, payload: { minVersion: '6.0.0' } });
const normal = (id: string) => ({ id, title: 'Existing content', payload: {} });
type Row = ReturnType<typeof normal> | ReturnType<typeof hidden>;

const setup = (
  query = 'newsItems',
  pages: Row[][] = [],
  initial: Row[] = [hidden('1'), hidden('2')],
  pageSize: number | undefined = 2
) => {
  const initialData = { [query]: initial };
  let cache = initialData;
  let nextPage = 0;
  const fetchMore = jest.fn(async (options) => {
    const result = { data: { [query]: pages[nextPage++] || [] } };
    cache = options.updateQuery(cache, { fetchMoreResult: result.data });
    return result;
  });
  const variables = { limit: 2, categoryId: 'existing-category', order: 'publishedAt_DESC' };
  const paginator = createContentPagination({
    fetchMore,
    query,
    queryDocument: 'original-query',
    variables,
    pageSize
  });
  return { initialData, paginator, fetchMore, variables, cache: () => cache };
};

it.each(['newsItems', 'tours', 'genericItems', 'pointsOfInterest', 'eventRecords'])(
  'continues %s past consecutive hidden pages using raw offsets',
  async (query) => {
    const first = [hidden('3'), hidden('4')];
    const second = [hidden('5'), hidden('6')];
    const last = [normal('7'), normal('8')];
    const test = setup(query, [first, second, last]);
    expect(test.paginator.shouldLoadMore(test.initialData)).toBe(true);
    const result = await test.paginator.loadMore(test.initialData, true);
    expect(result.data[query]).toEqual(last);
    expect(test.fetchMore.mock.calls.map(([options]) => options.variables)).toEqual(
      [2, 4, 6].map((offset) => ({ ...test.variables, offset }))
    );
    expect(test.cache()[query]).toHaveLength(8);
    expect(test.initialData[query]).toEqual([hidden('1'), hidden('2')]);
    expect(test.paginator.shouldLoadMore(test.cache())).toBe(false);
  }
);

it('keeps the existing one-page behavior and variables for unrestricted content', async () => {
  const test = setup('newsItems', [[normal('3'), normal('4')]], [normal('1'), normal('2')]);
  expect(test.paginator.shouldLoadMore(test.initialData)).toBe(false);
  await test.paginator.loadMore(test.initialData);
  expect(test.fetchMore).toHaveBeenCalledTimes(1);
  expect(test.fetchMore.mock.calls[0][0]).toMatchObject({
    query: 'original-query',
    variables: { ...test.variables, offset: 2 }
  });
});

it('continues a hidden next page even when earlier visible rows remain on screen', async () => {
  const test = setup(
    'tours',
    [[hidden('3'), hidden('4')], [normal('5')]],
    [normal('1'), normal('2')]
  );
  await test.paginator.loadMore(test.initialData);
  expect(test.fetchMore).toHaveBeenCalledTimes(2);
  expect(test.cache().tours.map(({ id }) => id)).toEqual(['1', '2', '3', '4', '5']);
});

it('stops at an empty page and does not automatically loop at EOF', async () => {
  const test = setup('newsItems', [[hidden('3')], []]);
  await test.paginator.loadMore(test.initialData, true);
  expect(test.fetchMore).toHaveBeenCalledTimes(2);
  expect(test.paginator.shouldLoadMore(test.cache())).toBe(false);
  await expect(test.paginator.loadMore(test.cache())).resolves.toEqual({ data: { newsItems: [] } });
  expect(test.fetchMore).toHaveBeenCalledTimes(2);
  test.paginator.reset();
  expect(test.paginator.shouldLoadMore(test.cache())).toBe(true);
});

it('stops duplicate-only responses without losing or duplicating cached records', async () => {
  const test = setup('newsItems', [[hidden('1'), hidden('2')]]);
  await test.paginator.loadMore(test.initialData);
  expect(test.fetchMore).toHaveBeenCalledTimes(1);
  expect(test.cache().newsItems).toEqual(test.initialData.newsItems);
  expect(test.paginator.shouldLoadMore(test.cache())).toBe(false);
});

it('does not automatically fetch unlimited datasets or empty initial results', () => {
  const test = setup();
  const unlimited = createContentPagination({
    fetchMore: test.fetchMore,
    query: 'newsItems',
    queryDocument: 'query',
    variables: {},
    pageSize: undefined
  });
  expect(unlimited.shouldLoadMore(test.initialData)).toBe(false);
  expect(test.paginator.shouldLoadMore({ newsItems: [] })).toBe(false);
  expect(test.fetchMore).not.toHaveBeenCalled();
});

it('shares in-flight work between automatic loading and end-reached events', async () => {
  const test = setup('newsItems', [[hidden('3')], [normal('4')]]);
  const first = test.paginator.loadMore(test.initialData, true);
  const second = test.paginator.loadMore(test.initialData);
  expect(first).toBe(second);
  await first;
  expect(test.fetchMore).toHaveBeenCalledTimes(2);
});

it('keeps cached data on failure, avoids automatic retry loops and allows explicit retry', async () => {
  const test = setup('newsItems', [[normal('3')]]);
  test.fetchMore.mockRejectedValueOnce(new Error('Temporary network failure'));
  await expect(test.paginator.loadMore(test.initialData, true)).rejects.toThrow('Temporary');
  expect(test.cache()).toBe(test.initialData);
  expect(test.paginator.shouldLoadMore(test.initialData)).toBe(false);
  await test.paginator.loadMore(test.initialData);
  expect(test.cache().newsItems).toHaveLength(3);
});

it('ignores stale responses and stops advancing after filter changes or unmount', async () => {
  const test = setup('newsItems');
  let complete!: () => void;
  test.fetchMore.mockImplementationOnce(
    (options) =>
      new Promise((resolve) => {
        complete = () => {
          const result = { data: { newsItems: [hidden('3'), hidden('4')] } };
          expect(options.updateQuery(test.initialData, { fetchMoreResult: result.data })).toBe(
            test.initialData
          );
          resolve(result);
        };
      })
  );
  const pending = test.paginator.loadMore(test.initialData, true);
  test.paginator.reset();
  complete();
  await pending;
  expect(test.fetchMore).toHaveBeenCalledTimes(1);
  expect(test.cache()).toBe(test.initialData);
});

it('does not automatically paginate queries without a fetch-more document', () => {
  const test = setup();
  const pagination = createContentPagination({
    fetchMore: test.fetchMore,
    query: 'newsItems',
    queryDocument: undefined,
    variables: test.variables,
    pageSize: 2
  });
  expect(pagination.shouldLoadMore(test.initialData)).toBe(false);
  expect(test.fetchMore).not.toHaveBeenCalled();
});
