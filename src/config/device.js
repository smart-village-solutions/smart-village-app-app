import { Dimensions, Platform } from 'react-native';
import { totalMemory } from 'expo-device';

export const device = {
  height: Dimensions.get('window').height,
  platform: Platform.OS,
  totalMemory,
  width: Dimensions.get('window').width
};
