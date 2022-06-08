import { Point } from 'react-native-maps';

export type MapMarker = {
  position: {
    lat: number;
    lng: number;
  };
  icon: any;
  iconAnchor?: Point;
  id?: string;
  title?: string;
};
