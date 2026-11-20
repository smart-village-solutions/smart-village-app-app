import type { LocationObject } from 'expo-location';

import type { LocationSettings } from '../types/LocationSettings';

export const hasLocationCoordinates = (
  location?: LocationObject | null
): location is LocationObject => {
  const { latitude, longitude } = location?.coords || {};
  return (
    typeof latitude === 'number' &&
    Number.isFinite(latitude) &&
    Math.abs(latitude) <= 90 &&
    typeof longitude === 'number' &&
    Number.isFinite(longitude) &&
    Math.abs(longitude) <= 180
  );
};

// A saved alternative is a fallback, never a replacement for an enabled GPS position.
export const resolveReferencePosition = (
  settings: LocationSettings,
  devicePosition?: LocationObject | null
): LocationObject | undefined => {
  if (settings.locationService) {
    return hasLocationCoordinates(devicePosition) ? devicePosition : undefined;
  }
  return [settings.alternativePosition, settings.defaultAlternativePosition].find(
    hasLocationCoordinates
  );
};
