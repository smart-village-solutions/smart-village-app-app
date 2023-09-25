import { Point } from 'react-native-maps';

export type MapMarker = {
  iconAnchor?: Point;
  iconName?: string;
  id?: string;
  position: {
    latitude: number;
    longitude: number;
  };
  title?: string;
};
