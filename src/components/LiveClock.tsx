import React, { useEffect, useMemo, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { colors, normalize } from '../config';

import { BoldText } from './Text';
import { Wrapper } from './Wrapper';

const SECOND_DIGIT_HEIGHT = normalize(54);

const AnimatedSeconds = ({ seconds }: { seconds: number }) => {
  const slideAnim = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    slideAnim.setValue(0);
    Animated.timing(slideAnim, {
      toValue: -SECOND_DIGIT_HEIGHT,
      duration: 1000,
      useNativeDriver: true,
      easing: Easing.linear
    }).start();
  }, [seconds, slideAnim]);

  const prev = ((seconds - 1 + 60) % 60).toString().padStart(2, '0');
  const current = seconds.toString().padStart(2, '0');
  const next = ((seconds + 1) % 60).toString().padStart(2, '0');
  const nextNext = ((seconds + 2) % 60).toString().padStart(2, '0');

  // Opacity transitions: current holds at full opacity for ~60% of the cycle
  const prevOpacity = slideAnim.interpolate({
    inputRange: [-SECOND_DIGIT_HEIGHT, -SECOND_DIGIT_HEIGHT * 0.4, 0],
    outputRange: [0, 0.15, 0.3],
    extrapolate: 'clamp'
  });

  const currentOpacity = slideAnim.interpolate({
    inputRange: [-SECOND_DIGIT_HEIGHT, -SECOND_DIGIT_HEIGHT * 0.4, 0],
    outputRange: [0.3, 1, 1],
    extrapolate: 'clamp'
  });

  const nextOpacity = slideAnim.interpolate({
    inputRange: [-SECOND_DIGIT_HEIGHT, -SECOND_DIGIT_HEIGHT * 0.4, 0],
    outputRange: [0.8, 0.2, 0.15],
    extrapolate: 'clamp'
  });

  const nextNextOpacity = slideAnim.interpolate({
    inputRange: [-SECOND_DIGIT_HEIGHT, -SECOND_DIGIT_HEIGHT * 0.4, 0],
    outputRange: [0.3, 0, 0],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.secondsSlotContainer}>
      <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
        <Animated.View style={[styles.secondSlot, { opacity: prevOpacity }]}>
          <BoldText style={styles.liveClockText}>{prev}</BoldText>
        </Animated.View>
        <Animated.View style={[styles.secondSlot, { opacity: currentOpacity }]}>
          <BoldText style={styles.liveClockText}>{current}</BoldText>
        </Animated.View>
        <Animated.View style={[styles.secondSlot, { opacity: nextOpacity }]}>
          <BoldText style={styles.liveClockText}>{next}</BoldText>
        </Animated.View>
        <Animated.View style={[styles.secondSlot, { opacity: nextNextOpacity }]}>
          <BoldText style={styles.liveClockText}>{nextNext}</BoldText>
        </Animated.View>
      </Animated.View>
    </View>
  );
};

export const LiveClock = ({ withAnimatedSeconds }: { withAnimatedSeconds?: boolean }) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = time.getHours().toString().padStart(2, '0');
  const minutes = time.getMinutes().toString().padStart(2, '0');

  const dateString = time.toLocaleDateString('de-DE', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <Wrapper itemsCenter noPaddingBottom>
      <View style={styles.clockRow}>
        <BoldText style={styles.liveClockText}>{hours}</BoldText>
        <BoldText style={styles.liveClockColon}>:</BoldText>
        <BoldText style={styles.liveClockText}>{minutes}</BoldText>
        <BoldText style={styles.liveClockColon}>:</BoldText>

        {withAnimatedSeconds ? (
          <AnimatedSeconds seconds={time.getSeconds()} />
        ) : (
          <BoldText style={styles.liveClockText}>
            {time.getSeconds().toString().padStart(2, '0')}
          </BoldText>
        )}
      </View>
      <BoldText style={withAnimatedSeconds ? styles.dateText : undefined}>{dateString}</BoldText>
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  liveClockText: {
    fontSize: normalize(48),
    lineHeight: SECOND_DIGIT_HEIGHT,
    textAlign: 'center'
  },
  liveClockColon: {
    fontSize: normalize(48),
    lineHeight: SECOND_DIGIT_HEIGHT,
    marginHorizontal: normalize(2)
  },
  clockRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  secondsSlotContainer: {
    height: SECOND_DIGIT_HEIGHT * 2,
    overflow: 'hidden',
    width: normalize(72)
  },
  secondSlot: {
    alignItems: 'center',
    height: SECOND_DIGIT_HEIGHT,
    justifyContent: 'center'
  },
  dateText: {
    bottom: normalize(15),
    color: colors.placeholder,
    left: normalize(90),
    position: 'absolute'
  }
});
