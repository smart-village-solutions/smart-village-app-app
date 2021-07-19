import { Platform, PlatformIOSStatic } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

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
    ? getStatusBarHeight()
    : orientation === 'portrait'
    ? getStatusBarHeight()
    : 0;
