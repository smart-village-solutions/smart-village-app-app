import { useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const RESET_ANIMATION_DURATION = 220;

const clamp = (value: number, lowerBound: number, upperBound: number) => {
  'worklet';

  return Math.min(Math.max(value, lowerBound), upperBound);
};

export const useZoomableSvgTransform = () => {
  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);

  const panGesture = useMemo(
    () =>
      Gesture.Pan()
        .averageTouches(true)
        .onBegin(() => {
          savedTranslateX.value = translateX.value;
          savedTranslateY.value = translateY.value;
        })
        .onUpdate((event) => {
          const maxPan = 1600 * scale.value;

          translateX.value = clamp(savedTranslateX.value + event.translationX, -maxPan, maxPan);
          translateY.value = clamp(savedTranslateY.value + event.translationY, -maxPan, maxPan);
        }),
    [savedTranslateX, savedTranslateY, scale, translateX, translateY]
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          scale.value = clamp(savedScale.value * event.scale, MIN_SCALE, MAX_SCALE);
        })
        .onEnd(() => {
          savedScale.value = scale.value;

          if (scale.value <= MIN_SCALE) {
            translateX.value = withTiming(0, { duration: RESET_ANIMATION_DURATION });
            translateY.value = withTiming(0, { duration: RESET_ANIMATION_DURATION });
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
          }
        }),
    [savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY]
  );

  const composedGesture = useMemo(
    () => Gesture.Simultaneous(panGesture, pinchGesture),
    [panGesture, pinchGesture]
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value }
    ] as const
  }));

  const reset = useCallback(() => {
    scale.value = withTiming(1, { duration: RESET_ANIMATION_DURATION });
    savedScale.value = 1;
    translateX.value = withTiming(0, { duration: RESET_ANIMATION_DURATION });
    translateY.value = withTiming(0, { duration: RESET_ANIMATION_DURATION });
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [savedScale, savedTranslateX, savedTranslateY, scale, translateX, translateY]);

  return {
    animatedStyle,
    gesture: composedGesture,
    reset
  };
};
