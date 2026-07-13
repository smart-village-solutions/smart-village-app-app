import type { LngLatBounds } from '@maplibre/maplibre-react-native';

import type { MapMarker } from '../../types';

export const getMarkerBounds = (markers: MapMarker[] | undefined): LngLatBounds | undefined => {
  const coordinates = markers
    ?.map(({ position }) => [position?.longitude, position?.latitude] as const)
    .filter((coordinate): coordinate is readonly [number, number] => {
      const [longitude, latitude] = coordinate;

      return (
        typeof longitude === 'number' &&
        Number.isFinite(longitude) &&
        longitude >= -180 &&
        longitude <= 180 &&
        typeof latitude === 'number' &&
        Number.isFinite(latitude) &&
        latitude >= -90 &&
        latitude <= 90
      );
    });

  if (!coordinates || coordinates.length < 2) return undefined;

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);

  return [
    Math.min(...longitudes),
    Math.min(...latitudes),
    Math.max(...longitudes),
    Math.max(...latitudes)
  ];
};
