import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react-native';

import { SettingsContext } from '../../src/SettingsProvider';
import { loadKlimaTalerOffers } from '../../src/klimaTaler/offers';
import { resolveOffersQuery } from '../../src/klimaTaler/offersConfiguration';
import { useMapOffers } from '../../src/klimaTaler/useMapOffers';

jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({})
}));
jest.mock('../../src/klimaTaler/offers', () => ({ loadKlimaTalerOffers: jest.fn() }));
jest.mock('../../src/hooks/map/mapFeatureConfig', () => ({
  useMapSettings: () => ({
    data: { mapCenterPosition: { latitude: 51.938, longitude: 8.879 } }
  })
}));
const load = loadKlimaTalerOffers as jest.Mock;
const feed = {
  center: { latitude: 51.938, longitude: 8.879 },
  radius_km: 10,
  count: 0,
  locations: []
};
let mockEnabled = true;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SettingsContext.Provider
    value={{ globalSettings: { settings: { 'klima-taler': mockEnabled } } } as never}
  >
    {children}
  </SettingsContext.Provider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockEnabled = true;
  load.mockResolvedValue(feed);
});

test('a disabled module never loads the external map feed', () => {
  mockEnabled = false;
  const hook = renderHook(() => useMapOffers(), { wrapper });
  expect(load).not.toHaveBeenCalled();
  expect(hook.result.current.locations).toEqual([]);
});

test('equivalent map settings do not refetch on rerender or map interaction', async () => {
  const hook = renderHook(() => useMapOffers(), { wrapper });
  await waitFor(() => expect(hook.result.current.loading).toBe(false));
  hook.rerender({});
  expect(load).toHaveBeenCalledTimes(1);
  expect(load).toHaveBeenCalledWith({
    latitude: 51.938,
    longitude: 8.879,
    language: 'de'
  });
});

test('hiding a source discards a late result; re-enabling loads again', async () => {
  let finish!: (data: typeof feed) => void;
  load.mockReturnValueOnce(
    new Promise((resolve) => {
      finish = resolve;
    })
  );
  const hook = renderHook(() => useMapOffers(), { wrapper });
  act(() => hook.result.current.toggle());
  await act(async () => finish(feed));
  expect(hook.result.current.visible).toBe(false);
  expect(hook.result.current.data).toBeUndefined();
  act(() => hook.result.current.toggle());
  await waitFor(() => expect(hook.result.current.data).toEqual(feed));
  expect(load).toHaveBeenCalledTimes(2);
});

test('remote disable removes loaded data immediately', async () => {
  const hook = renderHook(() => useMapOffers(), { wrapper });
  await waitFor(() => expect(hook.result.current.data).toEqual(feed));
  mockEnabled = false;
  hook.rerender({});
  expect(hook.result.current.enabled).toBe(false);
  expect(hook.result.current.data).toBeUndefined();
});

test('area queries omit radius unless explicitly configured', () => {
  expect(resolveOffersQuery({ offers: { area: 'detmold' } }, undefined)).toEqual({
    area: 'detmold',
    language: 'de'
  });
  expect(resolveOffersQuery({ offers: { area: 'detmold', radius: 25 } }, undefined)).toEqual({
    area: 'detmold',
    radius: 25,
    language: 'de'
  });
  expect(resolveOffersQuery({ offers: { area: 'detmold', radius: 0 } }, undefined)).toBeNull();
});
