import { LocationObjectCoords } from 'expo-location';
import { Point } from 'react-native-maps';

export type MapMarker = {
  iconAnchor?: Point;
  activeBackgroundColor?: string;
  activeIconColor?: string;
  iconBackgroundColor?: string;
  iconBorderColor?: string;
  iconColor?: string;
  iconName?: string;
  id?: string;
  position: LocationObjectCoords;
  serviceName?: string;
  title?: string;
};
