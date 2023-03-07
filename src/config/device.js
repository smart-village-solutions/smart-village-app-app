import { Dimensions, Platform } from 'react-native';

export const device = {
  height: Dimensions.get('window').height,
  isPad: Platform.isPad,
  platform: Platform.OS,
  width: Dimensions.get('window').width
};
