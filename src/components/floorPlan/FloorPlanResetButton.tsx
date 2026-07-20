import React, { memo } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button } from '../Button';
import { texts } from '../../config';

type Props = {
  onPress: () => void;
};

export const FloorPlanResetButton = memo(({ onPress }: Props) => (
  <View style={styles.container} pointerEvents="box-none">
    <Button
      small={false}
      smallest
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
    right: 16,
    top: 16
  }
});
