import { Point } from 'react-native-maps';

export type MapMarker = {
  iconAnchor?: Point;
  iconBackgroundColor?: string;
  iconBorderColor?: string;
  iconColor?: string;
  iconName?: string;
  id?: string;
  position: {
    latitude: number;
    longitude: number;
  };
  serviceName?: string;
  title?: string;
};
