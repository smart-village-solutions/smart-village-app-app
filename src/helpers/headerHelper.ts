import Constants from 'expo-constants';
import { Platform, PlatformIOSStatic } from 'react-native';

import { device } from '../config';

export const getHeaderHeight = (orientation: 'portrait' | 'landscape') =>
  // Android always 56
  // iOS:
  //   portrait: 44
  //   landscape: tablet 66 / phone 32
  Platform.select({
    android: 56,
    ios: orientation === 'landscape' ? (!(Platform as PlatformIOSStatic).isPad ? 32 : 66) : 44
  });

export const statusBarHeight = (orientation: 'portrait' | 'landscape') =>
  device.platform === 'android'
    ? Constants.statusBarHeight
    : orientation === 'portrait'
    ? Constants.statusBarHeight
    : 0;
