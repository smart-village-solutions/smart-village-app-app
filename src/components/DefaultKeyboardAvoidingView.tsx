import React from 'react';
import { useContext } from 'react';
import { KeyboardAvoidingView, Platform, PlatformIOSStatic, StyleSheet } from 'react-native';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { device } from '../config';
import { OrientationContext } from '../OrientationProvider';

const getHeaderHeight = (orientation: string) =>
  // Android always 56
  // iOS:
  //   portrait: 44
  //   landscape: tablet 66 / phone 32
  Platform.select({
    ios: orientation === 'landscape' ? (!(Platform as PlatformIOSStatic).isPad ? 32 : 66) : 44,
    default: 56
  });

const statusBarHeight = (orientation: string) =>
  device.platform === 'android'
    ? getStatusBarHeight()
    : orientation === 'portrait'
    ? getStatusBarHeight()
    : 0;

export const DefaultKeyboardAvoidingView = ({ children }: { children: React.ReactNode }) => {
  const { orientation } = useContext(OrientationContext);

  return (
    <KeyboardAvoidingView
      enabled={device.platform === 'ios'}
      behavior={device.platform === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={
        device.platform === 'ios'
          ? getHeaderHeight(orientation) + statusBarHeight(orientation)
          : undefined
      }
      style={styles.flex}
    >
      {children}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
