import React from 'react';
import { StyleSheet, TouchableOpacity, type TouchableOpacityProps } from 'react-native';

export const HEADER_ICON_TOUCH_TARGET_SIZE = 48;

export const HeaderIconButton = ({ children, style, ...props }: TouchableOpacityProps) => (
  <TouchableOpacity
    accessibilityRole="button"
    {...props}
    style={[styles.button, style, styles.minimumTarget]}
  >
    {children}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  minimumTarget: {
    minHeight: HEADER_ICON_TOUCH_TARGET_SIZE,
    minWidth: HEADER_ICON_TOUCH_TARGET_SIZE
  }
});
