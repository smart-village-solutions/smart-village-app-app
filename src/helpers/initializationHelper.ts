import * as Location from 'expo-location';

import { TERMS_AND_CONDITIONS_STORE_KEY } from '../OnboardingManager';
import { handleSystemPermissions } from '../pushNotifications/PermissionHandling';

import { showMatomoAlert } from './matomoHelper';
import { addToStore } from './storageHelper';

export enum Initializer {
  LocationService = 'locationService',
  MatomoTracking = 'matomoTracking',
  PushNotifications = 'pushNotifications',
  TermsAndConditions = 'termsAndConditions'
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
  [Initializer.PushNotifications]: handleSystemPermissions,
  [Initializer.TermsAndConditions]: async () =>
    await addToStore(TERMS_AND_CONDITIONS_STORE_KEY, 'accepted')
};
