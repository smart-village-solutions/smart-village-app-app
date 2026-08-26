import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../Button';
import { normalize, texts } from '../../config';

type Props = {
  onPress: () => void;
};

export const FloorPlanResetButton = memo(({ onPress }: Props) => (
  <View style={styles.container} pointerEvents="box-none">
    <Button
      accessibilityHint={texts.floorPlan.resetAccessibilityHint}
      accessibilityLabel={texts.floorPlan.resetAccessibilityLabel}
      small={false}
      smallest={false}
      invert
      notFullWidth
      onPress={onPress}
      title={texts.floorPlan.reset}
    />
  </View>
));

FloorPlanResetButton.displayName = 'FloorPlanResetButton';

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    right: normalize(16),
    top: normalize(16)
  }
});
