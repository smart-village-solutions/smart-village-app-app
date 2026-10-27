import { parseSueData } from '../../src/helpers/parser/sueParser';

jest.mock('../../src/config', () => ({
  consts: { ROOT_ROUTE_NAMES: { SUE: 'SUE' } },
  texts: jest.requireActual('../../src/config/texts').texts
}));
jest.mock('../../src/queries', () => jest.requireActual('../../src/queries/types'));
jest.mock('../../src/types', () => ({ ScreenName: { Detail: 'Detail' } }));
jest.mock('../../src/helpers/imageHelper', () => ({
  mainImageOfMediaContents: () => undefined,
  parsedImageAspectRatio: () => 1
}));

it('preserves legacy report IDs and navigation without a delivery label', () => {
  const [item] = parseSueData([{ serviceRequestId: 38107, title: 'Old report' }], 'myRequests', {});
  expect(item.title).toBe('#38107 Old report');
  expect(item.id).toBe(38107);
  expect(item.params.queryVariables.id).toBe(38107);
  expect(item.subtitle).toBeUndefined();
});

it('uses the local ID for unsent rows without inventing a backend ID', () => {
  const [item] = parseSueData(
    [{ localId: 'local-1', deliveryStatus: 'pending', title: 'New report' }],
    'myRequests',
    {}
  );
  expect(item.title).toBe('New report');
  expect(item.id).toBe('local-1');
  expect(item.params.localId).toBe('local-1');
  expect(item.params.queryVariables.id).toBeUndefined();
  expect(item.subtitle).toBe('Wartet auf Übermittlung');
});

it('keeps delivery visible in existing custom SUE layouts without changing their configuration', () => {
  const design = { sueListItem: { contentSequence: ['title', 'status'] } };
  const [item] = parseSueData(
    [{ localId: 'local-1', deliveryStatus: 'pending', title: 'New report' }],
    'myRequests',
    design
  );
  expect(item.appDesignSystem.sueListItem.contentSequence).toEqual(['title', 'status', 'subtitle']);
  expect(design.sueListItem.contentSequence).toEqual(['title', 'status']);
});

it('keeps distinct row keys when different backends return the same report ID', () => {
  const rows = parseSueData(
    [
      { localId: 'city-a', serviceRequestId: 123, title: 'First report' },
      { localId: 'city-b', serviceRequestId: 123, title: 'Second report' }
    ],
    'myRequests',
    {}
  );
  expect(rows.map((row) => row.id)).toEqual(['city-a', 'city-b']);
  expect(rows.map((row) => row.params.queryVariables.id)).toEqual([123, 123]);
});
