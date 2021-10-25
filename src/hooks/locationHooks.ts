import { useContext, useEffect, useState } from 'react';
import * as Location from 'expo-location';

import { SettingsContext } from '../SettingsProvider';
import { storageHelper } from '../helpers';
import { LocationSettings } from '../types';

const LOCATION_TIMEOUT = 6000;

const requestAndFetchPosition = async (
  setAndSyncLocationSettings: (arg: LocationSettings) => Promise<void>
) => {
  const { status } = await Location.requestForegroundPermissionsAsync();

  await setAndSyncLocationSettings({
    locationService: status === Location.PermissionStatus.GRANTED
  });

  if (status === Location.PermissionStatus.GRANTED) {
    let location: Location.LocationObject | undefined;
    try {
      let done = false;
      location = await Promise.race<Location.LocationObject | undefined>([
        Location.getCurrentPositionAsync({}),
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

export const useLocationSettings = () => {
  // @ts-expect-error settings are not properly typed
  const { locationSettings, setLocationSettings } = useContext(SettingsContext);

  const setAndSyncLocationSettings = async (newSettings: LocationSettings) => {
    setLocationSettings(newSettings);
    await storageHelper.setLocationSettings(newSettings);
  };

  return {
    locationSettings: locationSettings as LocationSettings,
    setAndSyncLocationSettings
  };
};

export const usePosition = (skip?: boolean) => {
  const { locationSettings, setAndSyncLocationSettings } = useLocationSettings();
  const [position, setPosition] = useState<Location.LocationObject>();
  const [loading, setLoading] = useState(false);

  const shouldGetPosition = !skip && locationSettings.locationService;

  useEffect(() => {
    let mounted = true;
    if (shouldGetPosition) {
      setLoading(true);
      requestAndFetchPosition(setAndSyncLocationSettings)
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

  // actively return undefined as the position, to avoid using the position from when the in app setting was true
  return { loading, position: shouldGetPosition ? position : undefined };
};
