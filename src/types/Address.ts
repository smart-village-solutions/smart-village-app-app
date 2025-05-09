import { LocationObjectCoords } from 'expo-location';

export type Address = {
  addition?: string;
  city?: string;
  geoLocation?: LocationObjectCoords;
  kind?: string;
  street?: string;
  zip?: string;
};
