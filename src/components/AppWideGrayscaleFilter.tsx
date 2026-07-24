import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';

type AppWideGrayscaleFilterProps = {
  children: React.ReactNode;
  isGrayscaleEnabled: boolean;
};

export const AppWideGrayscaleFilter = ({
  children,
  isGrayscaleEnabled
}: AppWideGrayscaleFilterProps) => {
  if (!isGrayscaleEnabled) {
    return <View style={styles.flex}>{children}</View>;
  }

  if (Platform.OS === 'android') {
    return <View style={[styles.flex, styles.androidGrayscale]}>{children}</View>;
  }

  return (
    <View style={[styles.flex, styles.isolationContext]}>
      <View style={styles.flex}>{children}</View>
      <View pointerEvents="none" style={styles.iosSaturationOverlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  androidGrayscale: {
    filter: [{ grayscale: 1 }]
  },
  flex: {
    flex: 1
  },
  iosSaturationOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#808080',
    mixBlendMode: 'saturation'
  },
  isolationContext: {
    isolation: 'isolate'
  }
});
