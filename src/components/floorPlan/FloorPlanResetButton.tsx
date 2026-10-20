import React, { memo } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { IconSet, normalize, texts } from '../../config';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { ThemeColorPalette } from '../../types/Theme';

type Props = {
  onPress: () => void;
};

export const FloorPlanResetButton = memo(({ onPress }: Props) => {
  const styles = useThemeStyles(createStyles);

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        accessibilityHint={texts.floorPlan.resetAccessibilityHint}
        accessibilityLabel={texts.floorPlan.resetAccessibilityLabel}
        accessibilityRole="button"
        activeOpacity={0.7}
        onPress={onPress}
        style={styles.button}
      >
        <View style={styles.iconContainer}>
          <IconSet.IconRefresh color={styles.icon.color} size={normalize(19)} strokeWidth={1.75} />
        </View>
      </TouchableOpacity>
    </View>
  );
});

FloorPlanResetButton.displayName = 'FloorPlanResetButton';

const createStyles = (colors: ThemeColorPalette) => ({
  button: {
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    minHeight: normalize(48),
    minWidth: normalize(48)
  },
  container: {
    left: normalize(16),
    position: 'absolute',
    top: normalize(80)
  },
  icon: {
    color: colors.primary
  },
  iconContainer: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderRgba,
    borderRadius: normalize(18),
    borderWidth: StyleSheet.hairlineWidth,
    height: normalize(36),
    justifyContent: 'center',
    width: normalize(36)
  }
});
