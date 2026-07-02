import { LocationObject, LocationObjectCoords } from 'expo-location';

import { MapMarker } from '../../types';

const DEFAULT_CENTER_LATITUDE = 51.1657;
const DEFAULT_CENTER_LONGITUDE = 10.4515;

type AlternativePosition = {
  coords?: {
    latitude?: number;
    longitude?: number;
  };
};

type CoordinatesLike = {
  latitude?: number;
  longitude?: number;
};

const hasValidCoordinates = (
  coords?: CoordinatesLike
): coords is {
  latitude: number;
  longitude: number;
} => !!coords?.latitude && !!coords?.longitude;

/**
 * Calculates initial map region based on available position data.
 */
export const calculateInitialRegion = ({
  currentPosition,
  defaultAlternativePosition,
  isMultipleMarkersMap,
  locations,
  mapCenterPosition,
  showsUserLocation
}: {
  currentPosition?: LocationObject;
  defaultAlternativePosition?: AlternativePosition;
  isMultipleMarkersMap: boolean;
  locations: MapMarker[];
  mapCenterPosition?: LocationObjectCoords;
  showsUserLocation: boolean;
}): Partial<LocationObjectCoords> => {
  let region: Partial<LocationObjectCoords> = {
    latitude: DEFAULT_CENTER_LATITUDE,
    longitude: DEFAULT_CENTER_LONGITUDE
  };

  if (defaultAlternativePosition) {
    region = {
      ...region,
      latitude: defaultAlternativePosition.coords?.latitude,
      longitude: defaultAlternativePosition.coords?.longitude
    };
  }

  if (mapCenterPosition) {
    region = { ...region, ...mapCenterPosition };
  }

  const isSingleLocation = !isMultipleMarkersMap || locations?.length === 1;
  const firstLocation = locations?.[0];
  const hasSingleLocationCenter = hasValidCoordinates(firstLocation?.position);

  if (isSingleLocation && hasSingleLocationCenter) {
    region = {
      ...region,
      latitude: firstLocation.position.latitude,
      longitude: firstLocation.position.longitude
    };
  }

  const hasExplicitMapCenter = !!mapCenterPosition || (isSingleLocation && hasSingleLocationCenter);
  const hasCurrentPosition = hasValidCoordinates(currentPosition?.coords);

  if (!hasExplicitMapCenter && showsUserLocation && hasCurrentPosition) {
    region = {
      ...region,
      latitude: currentPosition.coords.latitude,
      longitude: currentPosition.coords.longitude
    };
  }

  return region;
};
