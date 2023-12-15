import { Dimensions, Platform } from 'react-native';
import { DeviceType, deviceType, totalMemory } from 'expo-device';

export const device = {
  height: Dimensions.get('window').height,
  isTablet: deviceType === DeviceType.TABLET,
  platform: Platform.OS,
  totalMemory,
  width: Dimensions.get('window').width
};
