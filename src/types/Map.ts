import { LocationObjectCoords } from 'expo-location';

export type MapMarker = {
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
