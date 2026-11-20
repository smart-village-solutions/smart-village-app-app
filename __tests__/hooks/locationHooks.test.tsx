import { act, renderHook, waitFor } from '@testing-library/react-native';
import {
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync
} from 'expo-location';
import React, { createContext } from 'react';
import { AppState } from 'react-native';

import { storageHelper } from '../../src/helpers';
import {
  useLocationSettings,
  usePosition,
  useSystemPermission
} from '../../src/hooks/locationHooks';
import { SettingsContext } from '../../src/SettingsProvider';
import type { LocationSettings } from '../../src/types/LocationSettings';

jest.mock('expo-location', () => ({
  PermissionStatus: { GRANTED: 'granted', DENIED: 'denied' },
  LocationAccuracy: { Balanced: 3 },
  requestForegroundPermissionsAsync: jest.fn(),
  getForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn()
}));
jest.mock('../../src/helpers', () => ({ storageHelper: { setLocationSettings: jest.fn() } }));
jest.mock('../../src/SettingsProvider', () => ({
  SettingsContext: jest.requireActual('react').createContext({})
}));

const alternative = { coords: { latitude: 51, longitude: 9 } };
const device = { coords: { latitude: 52, longitude: 13 } };
const setLocationSettings = jest.fn();
let settings: LocationSettings;
let onAppStateChange: (state: string) => void;
const removeListener = jest.fn();
const Context = SettingsContext as ReturnType<
  typeof createContext<{
    locationSettings: LocationSettings;
    setLocationSettings: typeof setLocationSettings;
  }>
>;
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Context.Provider value={{ locationSettings: settings, setLocationSettings }}>
    {children}
  </Context.Provider>
);

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
    onAppStateChange = callback;
    return { remove: removeListener };
  });
  settings = {
    locationService: false,
    alternativePosition: alternative as LocationSettings['alternativePosition']
  };
  (requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  (getCurrentPositionAsync as jest.Mock).mockResolvedValue(device);
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test('a disabled location service returns the fallback without requesting GPS permission', async () => {
  const { result } = renderHook(() => usePosition(), { wrapper });
  await act(async () => undefined);
  expect(result.current).toEqual({ position: alternative, loading: false });
  expect(requestForegroundPermissionsAsync).not.toHaveBeenCalled();
});

test('GPS takes precedence while the saved alternative remains intact', async () => {
  settings.locationService = true;
  const { result } = renderHook(() => usePosition(), { wrapper });
  await waitFor(() => expect(result.current.position).toBe(device));
  expect(settings.alternativePosition).toBe(alternative);
  expect(storageHelper.setLocationSettings).toHaveBeenCalledWith(
    expect.objectContaining({ locationService: true, alternativePosition: alternative })
  );
});

test('a late permission response cannot re-enable GPS after the user switches it off', async () => {
  let resolvePermission: (value: { status: string }) => void = () => undefined;
  (requestForegroundPermissionsAsync as jest.Mock).mockReturnValue(
    new Promise((resolve) => {
      resolvePermission = resolve;
    })
  );
  settings.locationService = true;
  const { result, rerender } = renderHook(() => usePosition(), { wrapper });
  expect(result.current.loading).toBe(true);
  settings = { ...settings, locationService: false };
  rerender({});
  expect(result.current).toEqual({ position: alternative, loading: false });
  await act(async () => resolvePermission({ status: 'granted' }));
  expect(setLocationSettings).not.toHaveBeenCalled();
  expect(storageHelper.setLocationSettings).not.toHaveBeenCalled();
  expect(result.current).toEqual({ position: alternative, loading: false });
});

test('skipping location access also suppresses fallback positions', async () => {
  settings.locationService = true;
  const { result } = renderHook(() => usePosition(true), { wrapper });
  await act(async () => undefined);
  expect(result.current).toEqual({ position: undefined, loading: false });
  expect(requestForegroundPermissionsAsync).not.toHaveBeenCalled();
});

test('a denied system permission enables the fallback without changing the saved GPS preference', async () => {
  settings.locationService = true;
  (getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
  const { result } = renderHook(() => useLocationSettings(), { wrapper });
  await waitFor(() => expect(result.current.locationSettings.locationService).toBe(false));
  expect(result.current.locationSettings.alternativePosition).toBe(alternative);
  expect(settings.locationService).toBe(true);
  expect(storageHelper.setLocationSettings).not.toHaveBeenCalled();
  (getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'granted' });
  await act(async () => onAppStateChange('active'));
  expect(result.current.locationSettings.locationService).toBe(true);
});

test('permission revocation on returning to the app replaces device location with the fallback', async () => {
  settings.locationService = true;
  const { result } = renderHook(() => usePosition(), { wrapper });
  await waitFor(() => expect(result.current.position).toBe(device));
  (getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({ status: 'denied' });
  await act(async () => onAppStateChange('active'));
  expect(result.current.position).toBe(alternative);
  expect(result.current.loading).toBe(false);
});

test('a failed permission lookup preserves the last confirmed state and cleans up on unmount', async () => {
  const { result, unmount } = renderHook(() => useSystemPermission());
  await waitFor(() => expect(result.current?.status).toBe('granted'));
  (getForegroundPermissionsAsync as jest.Mock).mockRejectedValue(new Error('temporary failure'));
  await act(async () => onAppStateChange('active'));
  expect(result.current?.status).toBe('granted');
  unmount();
  expect(removeListener).toHaveBeenCalledTimes(1);
});

test('a late permission check cannot overwrite a newer permission response', async () => {
  let resolveFirst: (value: { status: string }) => void = () => undefined;
  (getForegroundPermissionsAsync as jest.Mock)
    .mockReturnValueOnce(
      new Promise((resolve) => {
        resolveFirst = resolve;
      })
    )
    .mockResolvedValue({ status: 'denied' });
  const { result } = renderHook(() => useSystemPermission());
  await act(async () => onAppStateChange('active'));
  expect(result.current?.status).toBe('denied');
  await act(async () => resolveFirst({ status: 'granted' }));
  expect(result.current?.status).toBe('denied');
});
