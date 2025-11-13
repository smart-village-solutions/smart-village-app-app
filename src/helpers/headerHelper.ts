import Constants from 'expo-constants';
import { Platform, PlatformIOSStatic } from 'react-native';

import { device } from '../config';

/**
 * Returns the appropriate header height based on the platform and device orientation.
 *
 * @param orientation - The current device orientation ('portrait' or 'landscape')
 * @returns The header height in pixels:
 * - Android: Always 56px
 * - iOS Portrait: 44px
 * - iOS Landscape: 32px for phones, 66px for tablets
 * - Default (unknown platform): 56px
 */
export const getHeaderHeight = (orientation: 'portrait' | 'landscape') =>
  Platform.select({
    android: 56,
    ios: orientation === 'landscape' ? (!(Platform as PlatformIOSStatic).isPad ? 32 : 66) : 44,
    default: 56
  }) ?? 56;

export const statusBarHeight = (orientation: 'portrait' | 'landscape') =>
  device.platform === 'android'
    ? Constants.statusBarHeight
    : orientation === 'portrait'
    ? Constants.statusBarHeight
    : 0;
