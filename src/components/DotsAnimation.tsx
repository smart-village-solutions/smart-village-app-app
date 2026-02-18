import React, { useEffect, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';

import { colors, normalize } from '../config';

/**
 * Animated typing indicator with three bouncing dots
 * Used to show that the bot is typing a response
 */
export const DotsAnimation = () => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  const topY = useMemo(() => -5, []);
  const bottomY = useMemo(() => 5, []);
  const duration = useMemo(() => 500, []);

  const dot1Style = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: dot1.value
        }
      ]
    }),
    [dot1]
  );

  const dot2Style = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: dot2.value
        }
      ]
    }),
    [dot2]
  );

  const dot3Style = useAnimatedStyle(
    () => ({
      transform: [
        {
          translateY: dot3.value
        }
      ]
    }),
    [dot3]
  );

  useEffect(() => {
    dot1.value = withRepeat(
      withSequence(withTiming(topY, { duration }), withTiming(bottomY, { duration })),
      -1,
      true
    );
  }, [dot1, topY, bottomY, duration]);

  useEffect(() => {
    dot2.value = withDelay(
      100,
      withRepeat(
        withSequence(withTiming(topY, { duration }), withTiming(bottomY, { duration })),
        -1,
        true
      )
    );
  }, [dot2, topY, bottomY, duration]);

  useEffect(() => {
    dot3.value = withDelay(
      200,
      withRepeat(
        withSequence(withTiming(topY, { duration }), withTiming(bottomY, { duration })),
        -1,
        true
      )
    );
  }, [dot3, topY, bottomY, duration]);

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dotWrapper, dot1Style]}>
        <View style={styles.dot} />
      </Animated.View>
      <Animated.View style={[styles.dotWrapper, dot2Style]}>
        <View style={styles.dot} />
      </Animated.View>
      <Animated.View style={[styles.dotWrapper, dot3Style]}>
        <View style={styles.dot} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  dotsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: normalize(4),
    paddingTop: normalize(4)
  },
  dotWrapper: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  dot: {
    width: normalize(8),
    height: normalize(8),
    borderRadius: normalize(4),
    backgroundColor: colors.darkText
  }
});
