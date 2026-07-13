import type { InitialViewState } from '@maplibre/maplibre-react-native';
import type { LngLatBounds } from '@maplibre/maplibre-react-native';

const INITIAL_BOUNDS_PADDING = { top: 50, right: 50, bottom: 50, left: 50 };

export const buildInitialViewState = ({
  bounds,
  latitude,
  longitude,
  zoom
}: {
  bounds?: LngLatBounds;
  latitude: number;
  longitude: number;
  zoom: number;
}): InitialViewState =>
  bounds
    ? { bounds, padding: INITIAL_BOUNDS_PADDING }
    : {
        center: [longitude, latitude],
        zoom
      };
