import React, { memo, useCallback } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { BoldText, RegularText } from '../Text';
import { consts, normalize, texts } from '../../config';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { ThemeColorPalette } from '../../types/Theme';

import { FloorPlanFloorConfig } from './types';

type Props = {
  floors: FloorPlanFloorConfig[];
  onFloorSelect: (floorId: string) => void;
  selectedFloorId: string;
};

export const FloorPlanFloorSwitcher = memo(({ floors, onFloorSelect, selectedFloorId }: Props) => {
  const styles = useThemeStyles(createStyles);

  const renderFloorButton = useCallback(
    (floor: FloorPlanFloorConfig) => {
      const isSelected = floor.id === selectedFloorId;
      const title = floor.title || floor.id;

      return (
        <TouchableOpacity
          key={floor.id}
          accessibilityLabel={`(${title}) ${consts.a11yLabel.button}`}
          accessibilityHint={texts.floorPlan.floorAccessibilityHint}
          accessibilityRole="button"
          accessibilityState={{ selected: isSelected }}
          activeOpacity={0.75}
          onPress={() => onFloorSelect(floor.id)}
          style={[styles.floorButton, isSelected && styles.selectedFloorButton]}
        >
          {isSelected ? (
            <BoldText smallest lightest numberOfLines={2} style={styles.floorText}>
              {title}
            </BoldText>
          ) : (
            <RegularText smallest numberOfLines={2} style={styles.floorText}>
              {title}
            </RegularText>
          )}
        </TouchableOpacity>
      );
    },
    [onFloorSelect, selectedFloorId, styles]
  );

  if (floors.length < 2) return null;

  return (
    <View style={styles.container} pointerEvents="box-none">
      {floors.map((floor) => renderFloorButton(floor))}
    </View>
  );
});

FloorPlanFloorSwitcher.displayName = 'FloorPlanFloorSwitcher';

const createStyles = (colors: ThemeColorPalette) => ({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.borderRgba,
    borderRadius: normalize(8),
    borderWidth: StyleSheet.hairlineWidth,
    elevation: 4,
    minWidth: normalize(56),
    overflow: 'hidden',
    position: 'absolute',
    right: normalize(16),
    top: normalize(62),
    shadowColor: colors.shadowRgba,
    shadowOffset: {
      height: 4,
      width: 0
    },
    shadowOpacity: 0.35,
    shadowRadius: 4
  },
  floorButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomColor: colors.borderRgba,
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: normalize(48),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(6)
  },
  floorText: {
    maxWidth: normalize(74),
    textAlign: 'center'
  },
  selectedFloorButton: {
    backgroundColor: colors.primary
  }
});
