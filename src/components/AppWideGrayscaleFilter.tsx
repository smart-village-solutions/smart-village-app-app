import React, { useEffect } from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { setIosGrayscaleCompositorEnabled } from '../../modules/grayscale-compositor';

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
  const usesAndroidFilter = isGrayscaleEnabled && Platform.OS === 'android';

  useEffect(() => {
    if (Platform.OS !== 'ios') return;

    void setIosGrayscaleCompositorEnabled(isGrayscaleEnabled);
  }, [isGrayscaleEnabled]);

  return (
    <View style={[style, baseStyle, usesAndroidFilter && styles.androidGrayscale]}>
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
