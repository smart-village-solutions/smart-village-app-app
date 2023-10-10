import {
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  getLastKnownPositionAsync,
  LocationAccuracy,
  LocationObject,
  LocationPermissionResponse,
  PermissionStatus,
  requestForegroundPermissionsAsync
} from 'expo-location';
import { useCallback, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

import { storageHelper } from '../helpers';
import { SettingsContext } from '../SettingsProvider';
import { LocationSettings } from '../types';

type RequestPermissionAndFetchFunction = (
  setAndSyncLocationSettings: (arg: LocationSettings) => Promise<void>
) => Promise<LocationObject | undefined>;

const LOCATION_TIMEOUT = 6000;

const requestAndFetchPosition: RequestPermissionAndFetchFunction = async (
  setAndSyncLocationSettings: (arg: LocationSettings) => Promise<void>
) => {
  const { status } = await requestForegroundPermissionsAsync();

  await setAndSyncLocationSettings({
    locationService: status === PermissionStatus.GRANTED
  });

  if (status === PermissionStatus.GRANTED) {
    let location: LocationObject | undefined;
    try {
      let done = false;
      location = await Promise.race<LocationObject | undefined>([
        getCurrentPositionAsync({
          accuracy: Platform.select({
            ios: LocationAccuracy.Balanced, // Balanced accuracy should result in ~100m accuracy
            default: undefined
          })
        }),
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, LOCATION_TIMEOUT);
        }).then(() => {
          !done && console.warn('Timeout while fetching position');
          return undefined;
        })
      ]);
      done = true;
    } catch (e) {
      console.warn(e);
      location = undefined;
    }

    return location;
  }
};

const requestAndFetchLastKnownPosition: RequestPermissionAndFetchFunction = async (
  setAndSyncLocationSettings: (arg: LocationSettings) => Promise<void>
) => {
  const { status } = await requestForegroundPermissionsAsync();

  await setAndSyncLocationSettings({
    locationService: status === PermissionStatus.GRANTED
  });

  if (status === PermissionStatus.GRANTED) {
    try {
      return (await getLastKnownPositionAsync({})) ?? undefined;
    } catch (e) {
      console.warn(e);
    }
  }
};

export const useSystemPermission = () => {
  const [systemPermission, setSystemPermission] = useState<LocationPermissionResponse>();

  useEffect(() => {
    (async () => setSystemPermission(await getForegroundPermissionsAsync()))();
  }, []);

  return systemPermission;
};

export const useLocationSettings = () => {
  // @ts-expect-error settings are not properly typed
  const { locationSettings, setLocationSettings } = useContext(SettingsContext);

  const setAndSyncLocationSettings = useCallback(
    async (newSettings: LocationSettings) => {
      const updatedSettings = { ...locationSettings, ...newSettings };

      setLocationSettings(updatedSettings);
      await storageHelper.setLocationSettings(updatedSettings);
    },
    [locationSettings]
  );

  return {
    locationSettings: locationSettings as LocationSettings,
    setAndSyncLocationSettings
  };
};

const usePos = (func: RequestPermissionAndFetchFunction, skip?: boolean) => {
  const { locationSettings, setAndSyncLocationSettings } = useLocationSettings();
  const [position, setPosition] = useState<LocationObject>();
  const [loading, setLoading] = useState(false);

  const shouldGetPosition = !skip && locationSettings.locationService !== false;

  useEffect(() => {
    let mounted = true;
    if (shouldGetPosition) {
      setLoading(true);
      func(setAndSyncLocationSettings)
        .then((result) => {
          if (mounted && result) {
            setPosition(result);
          }
        })
        .finally(() => setLoading(false));
    }
    return () => {
      mounted = false;
    };
  }, [shouldGetPosition]);

  // if skip, then don't return a position
  const returnPosition = skip
    ? undefined
    : locationSettings.locationService
    ? position
    : locationSettings.alternativePosition ?? locationSettings.defaultAlternativePosition;

  // actively return undefined as the position, to avoid using the position from when the in app setting was true
  return { loading, position: returnPosition };
};

export const usePosition = (skip?: boolean) => {
  return usePos(requestAndFetchPosition, skip);
};

export const useLastKnownPosition = (skip?: boolean) => {
  return usePos(requestAndFetchLastKnownPosition, skip);
};
