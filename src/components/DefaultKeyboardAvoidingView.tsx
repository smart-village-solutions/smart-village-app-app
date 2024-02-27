import React, { useContext } from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';

import { OrientationContext } from '../OrientationProvider';
import { device } from '../config';
import { getHeaderHeight, statusBarHeight } from '../helpers';

export const DefaultKeyboardAvoidingView = ({ children }: { children: React.ReactNode }) => {
  const { orientation } = useContext(OrientationContext);

  return (
    <KeyboardAvoidingView
      enabled={device.platform === 'ios'}
      behavior={device.platform === 'ios' ? 'padding' : undefined}
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
