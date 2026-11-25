import type { LocationObject } from 'expo-location';

import {
  hasLocationCoordinates,
  resolveReferencePosition
} from '../../src/helpers/locationReference';

const position = (latitude: number, longitude: number) =>
  ({ coords: { latitude, longitude } } as LocationObject);
const device = position(52, 13);
const alternative = position(51, 9);
const fallback = position(50, 8);

test('GPS takes precedence over a saved alternative and never silently falls back while enabled', () => {
  const settings = {
    locationService: true,
    alternativePosition: alternative,
    defaultAlternativePosition: fallback
  };
  expect(resolveReferencePosition(settings, device)).toBe(device);
  expect(resolveReferencePosition(settings)).toBeUndefined();
  expect(resolveReferencePosition(settings, position(NaN, 9))).toBeUndefined();
});

test('disabling GPS selects the saved alternative and then the configured default', () => {
  const settings = {
    locationService: false,
    alternativePosition: alternative,
    defaultAlternativePosition: fallback
  };
  expect(resolveReferencePosition(settings, device)).toBe(alternative);
  expect(resolveReferencePosition({ ...settings, alternativePosition: undefined }, device)).toBe(
    fallback
  );
  expect(resolveReferencePosition({ locationService: false }, device)).toBeUndefined();
  expect(settings.alternativePosition).toBe(alternative);
});

test.each([
  [0, 0],
  [-90, -180],
  [90, 180]
])('accepts valid coordinates including zero: %s, %s', (lat, lng) => {
  expect(hasLocationCoordinates(position(lat, lng))).toBe(true);
});

test.each([
  [NaN, 1],
  [1, Infinity],
  [91, 1],
  [1, -181]
])('rejects invalid coordinates: %s, %s', (lat, lng) => {
  expect(hasLocationCoordinates(position(lat, lng))).toBe(false);
  expect(
    resolveReferencePosition({
      alternativePosition: position(lat, lng),
      defaultAlternativePosition: fallback
    })
  ).toBe(fallback);
});
