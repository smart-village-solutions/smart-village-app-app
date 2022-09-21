import { Point } from 'react-native-maps';

export type MapMarker = {
  position: {
    latitude: number;
    longitude: number;
  };
  icon: any;
  iconAnchor?: Point;
  id?: string;
  title?: string;
};
