import {
  fetchVisibleContentPage,
  getNextContentPageOffset
} from '../../src/helpers/contentInfinitePagination';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '5.0.0',
  nativeBuildVersion: '1573'
}));

const hidden = (id: string) => ({ id, payload: { minVersion: '6.0.0' } });
const normal = (id: string) => ({ id, payload: {} });
const query = 'eventRecords';
const setup = (pages: Record<string, unknown>[][]) => {
  const fetchPage = jest.fn<Promise<{ eventRecords: Record<string, unknown>[] }>, [number]>(
    async () => ({ eventRecords: pages.shift() || [] })
  );
  const load = (options = {}) =>
    fetchVisibleContentPage({ fetchPage, query, pageSize: 2, ...options });
  return { fetchPage, load };
};

it('keeps unversioned pages and one-page requests unchanged', async () => {
  const data = { eventRecords: [normal('1'), normal('2')] };
  const fetchPage = jest.fn(async () => data);
  const result = await fetchVisibleContentPage({ fetchPage, query, pageSize: 2 });
  expect(result).toBe(data);
  expect(fetchPage).toHaveBeenCalledTimes(1);
  expect(getNextContentPageOffset(result, [result], query, 2)).toBe(2);
});

it('drains consecutive restricted pages without removing raw records or skipping offsets', async () => {
  const test = setup([
    [hidden('1'), hidden('2')],
    [hidden('3'), hidden('4')],
    [normal('5'), normal('6')]
  ]);
  const result = await test.load({ offset: 10 });
  expect(test.fetchPage.mock.calls.map(([offset]) => offset)).toEqual([10, 12, 14]);
  expect(result.eventRecords).toHaveLength(6);
  expect(getNextContentPageOffset(result, [{ eventRecords: Array(10) }, result], query, 2)).toBe(
    16
  );
});

it.each([{ page: [] }, { page: [normal('3')] }, { page: [hidden('3')] }])(
  'stops at a short final server page: %p',
  async ({ page: lastPage }) => {
    const test = setup([[hidden('1'), hidden('2')], lastPage]);
    const result = await test.load();
    expect(test.fetchPage).toHaveBeenCalledTimes(2);
    expect(getNextContentPageOffset(result, [result], query, 2)).toBeUndefined();
  }
);

it('stops duplicate-only responses', async () => {
  const test = setup([
    [hidden('1'), hidden('2')],
    [hidden('1'), hidden('2')]
  ]);
  const result = await test.load();
  expect(test.fetchPage).toHaveBeenCalledTimes(2);
  expect(getNextContentPageOffset(result, [result], query, 2)).toBeUndefined();
});

it('does not drain an aborted query', async () => {
  const test = setup([[hidden('1'), hidden('2')], [normal('3')]]);
  await test.load({ signal: { aborted: true } });
  expect(test.fetchPage).toHaveBeenCalledTimes(1);
});

it('honors publication filters while recovering a version-filtered result', async () => {
  const test = setup([
    [hidden('1'), hidden('2')],
    [
      { ...normal('3'), visible: false },
      { ...normal('4'), visible: false }
    ],
    [normal('5')]
  ]);
  const result = await test.load({
    getVisibleItems: (rows: { visible?: boolean }[]) => rows.filter((row) => row.visible !== false)
  });
  expect(test.fetchPage.mock.calls.map(([offset]) => offset)).toEqual([0, 2, 4]);
  expect(result.eventRecords).toHaveLength(5);
});

it.each(['listDate', 'date.id'])(
  'continues recurring events sharing an ID when only %s distinguishes occurrences',
  async (identity) => {
    const occurrence = (index: number) => ({
      ...hidden('recurring-event'),
      listDate: identity === 'listDate' ? `2030-01-0${index}` : '2030-01-01',
      date: { id: identity === 'date.id' ? `date-${index}` : 'same-date' }
    });
    const first = [occurrence(1), occurrence(2)];
    const second = [occurrence(3), occurrence(4)];
    const test = setup([first, second, [normal('eligible')]]);
    const result = await test.load();
    expect(test.fetchPage.mock.calls.map(([offset]) => offset)).toEqual([0, 2, 4]);
    expect(result.eventRecords).toEqual([...first, ...second, normal('eligible')]);
    expect(getNextContentPageOffset(result, [result], query, 2)).toBeUndefined();
  }
);

it('still stops genuinely repeated recurring occurrences', async () => {
  const page = [1, 2].map((index) => ({
    ...hidden('recurring-event'),
    listDate: `2030-01-0${index}`,
    date: { id: `date-${index}` }
  }));
  const test = setup([page, page, [normal('unreachable')]]);
  const result = await test.load();
  expect(test.fetchPage).toHaveBeenCalledTimes(2);
  expect(getNextContentPageOffset(result, [result], query, 2)).toBeUndefined();
});
