import * as Location from 'expo-location';

import { handleSystemPermissions } from '../pushNotifications';

export enum Initializer {
  LocationService = 'locationService',
  MatomoTracking = 'matomoTracking',
  PushNotifications = 'pushNotifications'
}

const initializeLocationServices = async () => {
  const { canAskAgain, status } = await Location.getForegroundPermissionsAsync();

  if (status !== Location.PermissionStatus.GRANTED && canAskAgain) {
    await Location.requestForegroundPermissionsAsync();
  }
};

// TODO: check how to do it with matomo and initialization differences (pre/post rendering the provider)
// -> change type from `() => void` to `(onboarding?: boolean) => void` ?
export const Initializers = {
  [Initializer.LocationService]: initializeLocationServices,
  [Initializer.MatomoTracking]: () => undefined, // TODO:  get permission -> request if not present
  [Initializer.PushNotifications]: handleSystemPermissions
};
