import { LocationObject } from 'expo-location';

export type LocationSettings = Partial<{
  locationService: boolean;
  alternativePosition: LocationObject;
  defaultAlternativePosition: LocationObject;
}>;
