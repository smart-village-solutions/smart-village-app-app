import {
  applyWidgetOrder,
  identifyWidgets,
  moveWidget,
  widgetDropTarget,
  widgetRows
} from '../../src/helpers/widgetOrder';

test('explicit IDs survive text and server ordering changes; duplicate widgets remain distinct', () => {
  const first = identifyWidgets([
    { widgetName: 'custom', id: 'town', text: 'Town' },
    'weather',
    'custom',
    'custom'
  ]);
  const changed = identifyWidgets([
    'weather',
    { widgetName: 'custom', id: 'town', text: 'New title' },
    'custom',
    'custom'
  ]);
  expect(new Set(first.map(({ id }) => id)).size).toBe(4);
  expect(
    applyWidgetOrder(
      changed,
      first.map(({ id }) => id)
    ).map(({ id }) => id)
  ).toEqual(first.map(({ id }) => id));
});

test('ignores stale, duplicate or invalid IDs and appends newly configured widgets', () => {
  const items = identifyWidgets(['weather', 'event', 'klimaTaler']);
  expect(
    applyWidgetOrder(items, ['removed', items[1].id, items[1].id, null]).map(({ config }) => config)
  ).toEqual(['event', 'weather', 'klimaTaler']);
  expect(applyWidgetOrder(items, {})).toEqual(items);
});

test('cards can move before, between or after compact runs', () => {
  const compact = { fullWidth: false };
  const card = { fullWidth: true };
  expect(widgetRows([compact, card, compact, compact], 5).map((row) => row.length)).toEqual([
    1, 1, 2
  ]);
  expect(widgetRows([card, compact, compact, compact], 2).map((row) => row.length)).toEqual([
    1, 2, 1
  ]);
});

test('drops work across compact and full-width widgets without resizing either', () => {
  const bounds = [
    { id: 'weather', x: 0, y: 0, width: 100, height: 100 },
    { id: 'event', x: 100, y: 0, width: 100, height: 100 },
    { id: 'climate', x: 0, y: 120, width: 200, height: 180 }
  ];
  expect(widgetDropTarget(bounds, 150, 50)).toBe('event');
  expect(widgetDropTarget(bounds, 10, 220)).toBe('climate');
  expect(widgetDropTarget(bounds, 150, 110)).toBe('event');
  expect(widgetDropTarget(bounds, 150, 500)).toBeUndefined();
  expect(moveWidget(['weather', 'event', 'climate'], 'weather', 'climate')).toEqual([
    'event',
    'climate',
    'weather'
  ]);
  expect(moveWidget(['weather', 'event', 'climate'], 'climate', 'weather')).toEqual([
    'climate',
    'weather',
    'event'
  ]);
  expect(moveWidget(['weather', 'event'], 'weather', undefined)).toEqual(['weather', 'event']);
});

test('widget-name aliases preserve saved ordering identity', () => {
  expect(identifyWidgets(['klima-taler'])[0].id).toBe(identifyWidgets(['klimaTaler'])[0].id);
});

test('drop targeting handles empty, unmeasured and single-widget layouts', () => {
  expect(widgetDropTarget([], 0, 0)).toBeUndefined();
  expect(
    widgetDropTarget([{ id: 'unmeasured', x: 0, y: 0, width: 0, height: 0 }], 0, 0)
  ).toBeUndefined();
  expect(widgetDropTarget([{ id: 'only', x: 0, y: 0, width: 100, height: 100 }], 50, 50)).toBe(
    'only'
  );
});
