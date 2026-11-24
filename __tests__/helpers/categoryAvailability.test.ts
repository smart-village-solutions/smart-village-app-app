import { AppRelease, filterContentByVersion } from '../../src/helpers/contentVisibility';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '4.3.0',
  nativeBuildVersion: '1565'
}));

const oldApp = { version: '4.3.0', build: '1565' };
const newApp = { version: '5.0.0', build: '1573' };
const requirements = { minVersion: '5.0.0', minBuild: 1573 };
const shopping = { id: '42', name: 'Shopping', parent: null };
const future = { id: '7559', name: 'Klima-Taler', parent: null };
const normal = { id: '10', category: shopping, visible: true, payload: {} };
const restricted = { id: '11', categories: [future], visible: true, payload: requirements };
const categories = [shopping, future].map((category) => ({
  ...category,
  pointsOfInterestTreeCount: 99,
  toursTreeCount: 0,
  children: []
}));

const catalogue = () => ({
  categories,
  categoryHierarchy: [shopping, future],
  categoryPointsOfInterest: [normal, restricted, { ...restricted, id: '12' }],
  categoryTours: []
});

test('4.3.0 excludes a category containing only restricted records and corrects ordinary counts', () => {
  const raw = catalogue();
  const snapshot = JSON.parse(JSON.stringify(raw));
  expect(filterContentByVersion(raw, oldApp).categories).toEqual([
    { ...categories[0], pointsOfInterestTreeCount: 1 }
  ]);
  expect(raw).toEqual(snapshot);
});

test.each<[AppRelease, boolean]>([
  [{ version: '5.0.0', build: '1572' }, false],
  [{ version: '5.0.0', build: '1573' }, true],
  [{ version: '5.1.0', build: '1500' }, false],
  [{ version: '5.1.0', build: '1600' }, true]
])('category availability respects both version and build: %p', (app, available) => {
  const result = filterContentByVersion(catalogue(), app);
  expect(result.categories.some(({ id }) => id === future.id)).toBe(available);
  if (available) expect(result.categories[1].pointsOfInterestTreeCount).toBe(2);
});

test('invisible POIs never contribute to a category, even on an eligible app with stale server counts', () => {
  const raw = catalogue();
  raw.categoryPointsOfInterest = raw.categoryPointsOfInterest.map((item) => ({
    ...item,
    visible: false
  }));
  expect(filterContentByVersion(raw, newApp).categories).toEqual([]);
});

test('empty root resource lists override stale counts after CMS unpublishing', () => {
  expect(
    filterContentByVersion({ ...catalogue(), categoryPointsOfInterest: [] }, newApp).categories
  ).toEqual([]);
});

test('ancestors count descendants once across multiple category assignments and duplicate resource rows', () => {
  const parent = { id: '1', name: 'Parent', parent: null };
  const child = { id: '2', name: 'Child', parent };
  const leaf = { id: '3', name: 'Leaf', parent: child };
  const item = { id: '10', categories: [child, leaf], category: parent };
  const raw = {
    categories: [{ ...parent, children: [{ ...child, children: [leaf] }] }],
    categoryHierarchy: [parent, child, leaf],
    categoryPointsOfInterest: [item, item],
    categoryTours: []
  };
  const result = filterContentByVersion(raw, oldApp).categories[0];
  expect(result).toMatchObject({
    pointsOfInterestTreeCount: 1,
    children: [{ pointsOfInterestTreeCount: 1, children: [{ pointsOfInterestTreeCount: 1 }] }]
  });
});

test('the flat hierarchy includes descendants deeper than the displayed category tree', () => {
  const hierarchy = Array.from({ length: 12 }, (_, index) => ({
    id: String(index),
    name: `Category ${index}`,
    parent: index ? { id: String(index - 1) } : null
  }));
  const raw = {
    categories: [hierarchy[0]],
    categoryHierarchy: hierarchy,
    categoryPointsOfInterest: [{ id: 1, categories: [hierarchy[11]] }],
    categoryTours: []
  };
  expect(filterContentByVersion(raw, oldApp).categories[0]).toMatchObject({
    pointsOfInterestTreeCount: 1
  });
});

test('preserves tour-only categories while removing invisible and restricted tours', () => {
  const raw = {
    ...catalogue(),
    categoryPointsOfInterest: [],
    categoryTours: [
      { id: '1', category: shopping },
      { id: '2', category: shopping, visible: false },
      { id: '3', category: future, payload: requirements }
    ]
  };
  expect(filterContentByVersion(raw, oldApp).categories).toMatchObject([
    { id: shopping.id, pointsOfInterestTreeCount: 0, toursTreeCount: 1 }
  ]);
});

test('normalizes numeric IDs and supports global categories matched by the server category name', () => {
  const raw = {
    ...catalogue(),
    categoryPointsOfInterest: [
      { id: 1, categories: [{ id: 42 }] },
      { id: 2, category: { id: 'global-shopping', name: shopping.name } }
    ]
  };
  expect(filterContentByVersion(raw, oldApp).categories[0].pointsOfInterestTreeCount).toBe(2);
});

test('connects active children promoted past inactive parents by the category response', () => {
  const parent = { id: '1', name: 'Parent' };
  const child = { id: '3', name: 'Child', parent: { id: 'inactive-parent' } };
  const raw = {
    categories: [{ ...parent, children: [child] }],
    categoryHierarchy: [parent, child],
    categoryPointsOfInterest: [{ id: 1, category: child }],
    categoryTours: []
  };
  expect(filterContentByVersion(raw, oldApp).categories[0]).toMatchObject({
    pointsOfInterestTreeCount: 1
  });
});

test('does not add excluded root categories or change legacy category response shapes', () => {
  const raw = { ...catalogue(), categories: [categories[0]] };
  expect(filterContentByVersion(raw, newApp).categories.map(({ id }) => id)).toEqual([shopping.id]);
  const legacy = { categories };
  expect(filterContentByVersion(legacy, oldApp)).toBe(legacy);
});

test('incomplete availability data does not show misleading counts', () => {
  const raw = { ...catalogue(), categoryTours: null };
  expect(filterContentByVersion(raw, oldApp).categories).toEqual([]);
});
