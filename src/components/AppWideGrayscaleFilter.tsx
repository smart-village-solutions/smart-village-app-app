import React from 'react';
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import { useThemeStyles } from '../hooks/useThemeStyles';

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
  const styles = useThemeStyles(createStyles);
  const baseStyle = fillContainer ? styles.flex : undefined;
  const isAndroid = Platform.OS === 'android';

  return (
    <View
      style={[
        style,
        baseStyle,
        !isAndroid && isGrayscaleEnabled && styles.isolationContext,
        isAndroid && isGrayscaleEnabled && styles.androidGrayscale
      ]}
    >
      <View style={baseStyle}>{children}</View>
      {!isAndroid && isGrayscaleEnabled ? (
        <View pointerEvents="none" style={styles.iosSaturationOverlay} />
      ) : null}
    </View>
  );
};

const createStyles = (colors) => ({
  androidGrayscale: {
    filter: [{ grayscale: 1 }]
  },

  flex: {
    flex: 1
  },

  iosSaturationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.placeholder,
    mixBlendMode: 'saturation'
  },

  isolationContext: {
    isolation: 'isolate'
  }
});
