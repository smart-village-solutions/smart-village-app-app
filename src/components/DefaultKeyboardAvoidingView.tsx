import { useHeaderHeight } from '@react-navigation/elements';
import React from 'react';
import { KeyboardAvoidingView, StyleSheet } from 'react-native';

import { device } from '../config';

export const DefaultKeyboardAvoidingView = ({ children }: { children: React.ReactNode }) => {
  const headerHeight = useHeaderHeight();

  return (
    <KeyboardAvoidingView
      behavior={device.platform === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={device.platform === 'ios' ? headerHeight : undefined}
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
