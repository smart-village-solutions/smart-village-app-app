import * as Location from 'expo-location';

import { handleSystemPermissions } from '../pushNotifications';

import { showMatomoAlert } from './matomoHelper';

export enum Initializer {
  LocationService = 'locationService',
  MatomoTracking = 'matomoTracking',
  PushNotifications = 'pushNotifications'
}

const initializeLocationServices = async () => {
  const { status } = await Location.getForegroundPermissionsAsync();

  if (status === Location.PermissionStatus.UNDETERMINED) {
    await Location.requestForegroundPermissionsAsync();
  }
};

export const Initializers = {
  [Initializer.LocationService]: initializeLocationServices,
  [Initializer.MatomoTracking]: showMatomoAlert,
  [Initializer.PushNotifications]: handleSystemPermissions
};
