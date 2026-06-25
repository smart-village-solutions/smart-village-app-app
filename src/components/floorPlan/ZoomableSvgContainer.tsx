import React, { ReactNode, memo } from 'react';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';
import Svg from 'react-native-svg';

import { colors } from '../../config';

import { FloorPlanViewBox } from './types';

type Props = {
  animatedStyle: object;
  children: ReactNode;
  gesture: ReturnType<typeof Gesture.Simultaneous>;
  viewBox: FloorPlanViewBox;
};

export const ZoomableSvgContainer = memo(({ animatedStyle, children, gesture, viewBox }: Props) => {
  const aspectRatio = viewBox.width / viewBox.height;
  const viewBoxValue = `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`;

  return (
    <View style={styles.viewport}>
      <View style={[styles.aspectContainer, { aspectRatio }]}>
        <GestureDetector gesture={gesture}>
          <Animated.View style={[styles.transformedSurface, animatedStyle]}>
            <Svg
              width="100%"
              height="100%"
              viewBox={viewBoxValue}
              preserveAspectRatio="xMidYMid meet"
            >
              {children}
            </Svg>
          </Animated.View>
        </GestureDetector>
      </View>
    </View>
  );
});

ZoomableSvgContainer.displayName = 'ZoomableSvgContainer';

const styles = StyleSheet.create({
  aspectContainer: {
    maxHeight: '100%',
    width: '100%'
  },
  transformedSurface: {
    flex: 1
  },
  viewport: {
    alignItems: 'center',
    backgroundColor: colors.backgroundRgba,
    flex: 1,
    justifyContent: 'center',
    overflow: 'hidden'
  }
});
