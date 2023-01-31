import { AccessibilityInfo } from 'react-native';

import { TAccessibility } from '../types';

// for detailed information: https://reactnative.dev/docs/accessibilityinfo#addeventlistener

export const accessibilityListeners = (setAccessibility: (prev: any) => void) => {
  /* Fires when the state of the bold text toggle changes. 
  The argument to the event handler is a boolean. 
  The boolean is true when bold text is enabled and false otherwise. */
  const boldTextChangedSubscription = AccessibilityInfo.addEventListener(
    'boldTextChanged',
    (isBoldTextEnabled) => {
      setAccessibility((prev: TAccessibility) => ({
        ...prev,
        isBoldTextEnabled
      }));
    }
  );

  /* Fires when the state of the gray scale toggle changes. 
  The argument to the event handler is a boolean. 
  The boolean is true when a gray scale is enabled and false otherwise. */
  const grayscaleChangedSubscription = AccessibilityInfo.addEventListener(
    'grayscaleChanged',
    (isGrayscaleEnabled) => {
      setAccessibility((prev: TAccessibility) => ({
        ...prev,
        isGrayscaleEnabled
      }));
    }
  );

  /* Fires when the state of the invert colors toggle changes. 
  The argument to the event handler is a boolean. 
  The boolean is true when invert colors is enabled and false otherwise. */
  const invertColorsChangedSubscription = AccessibilityInfo.addEventListener(
    'invertColorsChanged',
    (isInvertColorsEnabled) => {
      setAccessibility((prev: TAccessibility) => ({
        ...prev,
        isInvertColorsEnabled
      }));
    }
  );

  /* Fires when the state of the reduce transparency toggle changes. 
  The argument to the event handler is a boolean. 
  The boolean is true when reduce transparency is enabled and false otherwise. */
  const reduceTransparencyChangedSubscription = AccessibilityInfo.addEventListener(
    'reduceTransparencyChanged',
    (isReduceTransparencyEnabled) => {
      setAccessibility((prev: TAccessibility) => ({
        ...prev,
        isReduceTransparencyEnabled
      }));
    }
  );

  /* Fires when the state of the reduce motion toggle changes. 
  The argument to the event handler is a boolean. 
  The boolean is true when a reduce motion is enabled 
  (or when "Transition Animation Scale" in "Developer options" is "Animation off") 
  and false otherwise. */
  const reduceMotionChangedSubscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    (isReduceMotionEnabled) => {
      setAccessibility((prev: TAccessibility) => ({
        ...prev,
        isReduceMotionEnabled
      }));
    }
  );

  /* Fires when the state of the screen reader changes. 
  The argument to the event handler is a boolean. 
  The boolean is true when a screen reader is enabled and false otherwise. */
  const screenReaderChangedSubscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    (isScreenReaderEnabled) => {
      setAccessibility((prev: TAccessibility) => ({
        ...prev,
        isScreenReaderEnabled
      }));
    }
  );

  AccessibilityInfo.isBoldTextEnabled().then((isBoldTextEnabled) => {
    setAccessibility((prev: TAccessibility) => ({ ...prev, isBoldTextEnabled }));
  });
  AccessibilityInfo.isGrayscaleEnabled().then((isGrayscaleEnabled) => {
    setAccessibility((prev: TAccessibility) => ({ ...prev, isGrayscaleEnabled }));
  });
  AccessibilityInfo.isInvertColorsEnabled().then((isInvertColorsEnabled) => {
    setAccessibility((prev: TAccessibility) => ({ ...prev, isInvertColorsEnabled }));
  });
  AccessibilityInfo.isReduceMotionEnabled().then((isReduceTransparencyEnabled) => {
    setAccessibility((prev: TAccessibility) => ({ ...prev, isReduceTransparencyEnabled }));
  });
  AccessibilityInfo.isReduceMotionEnabled().then((isReduceMotionEnabled) => {
    setAccessibility((prev: TAccessibility) => ({ ...prev, isReduceMotionEnabled }));
  });
  AccessibilityInfo.isScreenReaderEnabled().then((isScreenReaderEnabled) => {
    setAccessibility((prev: TAccessibility) => ({ ...prev, isScreenReaderEnabled }));
  });

  return () => {
    boldTextChangedSubscription.remove();
    grayscaleChangedSubscription.remove();
    invertColorsChangedSubscription.remove();
    reduceMotionChangedSubscription.remove();
    reduceTransparencyChangedSubscription.remove();
    screenReaderChangedSubscription.remove();
  };
};
