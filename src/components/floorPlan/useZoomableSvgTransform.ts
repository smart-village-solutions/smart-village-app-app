import { useCallback, useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

// Reanimated shared values are intentionally mutable inside UI-thread worklets.
/* eslint-disable react-hooks/immutability */

const MIN_SCALE = 1;
const MAX_SCALE = 6;
const RESET_ANIMATION_DURATION = 220;

export const useZoomableSvgTransform = (reduceMotion = false) => {
  const resetAnimationDuration = reduceMotion ? 0 : RESET_ANIMATION_DURATION;
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
          const nextTranslateX = savedTranslateX.value + event.translationX;
          const nextTranslateY = savedTranslateY.value + event.translationY;

          translateX.value = Math.min(Math.max(nextTranslateX, -maxPan), maxPan);
          translateY.value = Math.min(Math.max(nextTranslateY, -maxPan), maxPan);
        }),
    [savedTranslateX, savedTranslateY, scale, translateX, translateY]
  );

  const pinchGesture = useMemo(
    () =>
      Gesture.Pinch()
        .onUpdate((event) => {
          const nextScale = savedScale.value * event.scale;

          scale.value = Math.min(Math.max(nextScale, MIN_SCALE), MAX_SCALE);
        })
        .onEnd(() => {
          savedScale.value = scale.value;

          if (scale.value <= MIN_SCALE) {
            translateX.value = withTiming(0, { duration: resetAnimationDuration });
            translateY.value = withTiming(0, { duration: resetAnimationDuration });
            savedTranslateX.value = 0;
            savedTranslateY.value = 0;
          }
        }),
    [
      resetAnimationDuration,
      savedScale,
      savedTranslateX,
      savedTranslateY,
      scale,
      translateX,
      translateY
    ]
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
    scale.value = withTiming(1, { duration: resetAnimationDuration });
    savedScale.value = 1;
    translateX.value = withTiming(0, { duration: resetAnimationDuration });
    translateY.value = withTiming(0, { duration: resetAnimationDuration });
    savedTranslateX.value = 0;
    savedTranslateY.value = 0;
  }, [
    resetAnimationDuration,
    savedScale,
    savedTranslateX,
    savedTranslateY,
    scale,
    translateX,
    translateY
  ]);

  return {
    animatedStyle,
    gesture: composedGesture,
    reset
  };
};

/* eslint-enable react-hooks/immutability */
