import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

type AppWideGrayscaleFilterProps = {
  children: React.ReactNode;
  fillContainer?: boolean;
  isGrayscaleEnabled: boolean;
  style?: StyleProp<ViewStyle>;
};

export const AppWideGrayscaleFilter = ({
  children,
  fillContainer = true,
  isGrayscaleEnabled,
  style
}: AppWideGrayscaleFilterProps) => {
  const baseStyle = fillContainer ? styles.flex : undefined;
  const isAndroid = Platform.OS === 'android';

  // React Native supports descendant grayscale filters only on Android.
  // iOS is handled through the grayscale theme palette and per-image filters.
  return (
    <View style={[style, baseStyle, isAndroid && isGrayscaleEnabled && styles.androidGrayscale]}>
      <View style={baseStyle}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  androidGrayscale: {
    filter: [{ grayscale: 1 }]
  },

  flex: {
    flex: 1
  }
});
