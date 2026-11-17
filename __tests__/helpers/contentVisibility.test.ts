import {
  filterContentByVersion,
  isContentAvailable,
  meetsMinimumVersion,
  visibleContent
} from '../../src/helpers/contentVisibility';

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '4.3.0',
  nativeBuildVersion: '1500'
}));
const minimum = { minVersion: '5.0.0', minBuild: 1573 };
const ordinary = Object.freeze({ id: '10', payload: { id: 'original-id' } });
const restricted = Object.freeze({
  id: '20',
  payload: { ...minimum, klimaTaler: { offerId: 123 } }
});

it.each([
  ['4.3.0', '2000', false],
  ['5.0.0', '1572', false],
  ['5.0.0', '1573', true],
  ['5.0.0', '1574', true],
  ['5.1.0', '1573', true],
  ['5.1.0', '1572', false],
  ['5.0.0-beta.1', '1573', false],
  ['5.0.0+ota.99', '1573', true]
])('applies both minimum conditions to %s build %s', (version, build, expected) => {
  expect(isContentAvailable(minimum, { version, build })).toBe(expected);
});

it.each([
  ['5.10.0', '5.9.0', true],
  ['5.2.0', '5.10.0', false],
  ['6.0.0', '5.99.99', true],
  ['5.0.1', '5.0.0', true],
  ['5.0.0-beta.10', '5.0.0-beta.2', true],
  ['5.0.0-beta', '5.0.0-alpha', true],
  ['5.0.0', '5.0.0-beta', true],
  ['5.0.0-beta', '5.0.0', false],
  ['invalid', '5.0.0', false],
  ['5.0.0', 'invalid', false],
  ['5.00.0', '5.0.0', false],
  ['5.0.0-beta.01', '5.0.0-beta.1', false],
  ['5.0.0+build.001', '5.0.0', true],
  ['5.0.0-alpha.10+build.001', '5.0.0-alpha.2', true],
  ['5.0.0+meta..1', '5.0.0', false],
  ['5.0.0+.meta', '5.0.0', false],
  ['5.0.0+meta.', '5.0.0', false],
  ['5.0.0+', '5.0.0', false],
  ['5.0.0+meta+extra', '5.0.0', false],
  ['5.0.0+meta_1', '5.0.0', false],
  ['5.0.0', '5.0.0+meta..1', false]
])('compares versions numerically: %s >= %s', (version, min, expected) => {
  expect(meetsMinimumVersion(version, min)).toBe(expected);
});

it.each([
  undefined,
  null,
  {},
  { id: 'keep' },
  { klimaTaler: { offerId: 123 } },
  { minVersion: null, minBuild: null }
])('preserves existing payloads with no requirements: %p', (payload) => {
  expect(isContentAvailable(payload, { version: null, build: null })).toBe(true);
});

it('supports independently optional version and build restrictions', () => {
  expect(isContentAvailable({ minVersion: '5.0.0' }, { version: '5.0.0', build: null })).toBe(true);
  expect(isContentAvailable({ minBuild: 1573 }, { version: null, build: '1573' })).toBe(true);
  expect(isContentAvailable({ minBuild: '1573.1' }, { version: null, build: '1573.2' })).toBe(true);
});

it.each([
  { minBuild: -1 },
  { minBuild: 1.5 },
  { minBuild: 'abc' },
  { minBuild: true },
  { minVersion: 5 },
  { minVersion: '' }
])('hides invalid explicit requirements rather than publishing prematurely: %p', (payload) => {
  expect(isContentAvailable(payload, { version: '5.0.0', build: '1573' })).toBe(false);
});

it('hides restricted content if installed app information is unavailable', () => {
  expect(isContentAvailable(minimum, { version: null, build: null })).toBe(false);
  expect(isContentAvailable(minimum, { version: '5.0.0', build: null })).toBe(false);
});

it('filters nested lists, details and offline snapshots without changing cache, offsets or metadata', () => {
  const data = {
    pointsOfInterest: [restricted, ordinary],
    genericItems: [ordinary, restricted],
    genericItem: restricted
  };
  const serialized = JSON.stringify(data);
  expect(visibleContent(data)).toEqual({
    pointsOfInterest: [ordinary],
    genericItems: [ordinary],
    genericItem: null
  });
  expect(visibleContent(JSON.parse(serialized))).toEqual(visibleContent(data));
  expect(JSON.stringify(data)).toBe(serialized);
  expect(data.pointsOfInterest).toHaveLength(2);
  expect(visibleContent(data).genericItems[0]).toBe(ordinary);
  expect(filterContentByVersion(data, { version: '5.0.0', build: '1573' })).toBe(data);
});

it('uses the native installed build rather than app.json values', () => {
  expect(visibleContent({ genericItems: [restricted, ordinary] }).genericItems).toEqual([ordinary]);
});
