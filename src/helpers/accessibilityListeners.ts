import { AccessibilityInfo } from 'react-native';

import { Accessibility } from '../types';

// for detailed information: https://reactnative.dev/docs/accessibilityinfo#addeventlistener
export const accessibilityListeners = (setAccessibility: (prev: any) => void) => {
  /*
   * Fires when the state of the bold text toggle changes.
   * Is true when bold text is enabled and false otherwise.
   **/
  const boldTextChangedSubscription = AccessibilityInfo.addEventListener(
    'boldTextChanged',
    (isBoldTextEnabled) => {
      setAccessibility((prev: Accessibility) => ({
        ...prev,
        isBoldTextEnabled
      }));
    }
  );

  /*
   * Fires when the state of the gray scale toggle changes.
   * Is true when a gray scale is enabled and false otherwise.
   **/
  const grayscaleChangedSubscription = AccessibilityInfo.addEventListener(
    'grayscaleChanged',
    (isGrayscaleEnabled) => {
      setAccessibility((prev: Accessibility) => ({
        ...prev,
        isGrayscaleEnabled
      }));
    }
  );

  /*
   * Fires when the state of the invert colors toggle changes.
   * Is true when invert colors is enabled and false otherwise.
   **/
  const invertColorsChangedSubscription = AccessibilityInfo.addEventListener(
    'invertColorsChanged',
    (isInvertColorsEnabled) => {
      setAccessibility((prev: Accessibility) => ({
        ...prev,
        isInvertColorsEnabled
      }));
    }
  );

  /*
   * Fires when the state of the reduce motion toggle changes.
   * Is true when a reduce motion is enabled (or when "Transition Animation Scale"
   * in "Developer options" is "Animation off") and false otherwise.
   **/
  const reduceMotionChangedSubscription = AccessibilityInfo.addEventListener(
    'reduceMotionChanged',
    (isReduceMotionEnabled) => {
      setAccessibility((prev: Accessibility) => ({
        ...prev,
        isReduceMotionEnabled
      }));
    }
  );

  /*
   * Fires when the state of the reduce transparency toggle changes.
   * Is true when reduce transparency is enabled and false otherwise.
   **/
  const reduceTransparencyChangedSubscription = AccessibilityInfo.addEventListener(
    'reduceTransparencyChanged',
    (isReduceTransparencyEnabled) => {
      setAccessibility((prev: Accessibility) => ({
        ...prev,
        isReduceTransparencyEnabled
      }));
    }
  );

  /*
   * Fires when the state of the screen reader changes.
   * Is true when a screen reader is enabled and false otherwise.
   **/
  const screenReaderChangedSubscription = AccessibilityInfo.addEventListener(
    'screenReaderChanged',
    (isScreenReaderEnabled) => {
      setAccessibility((prev: Accessibility) => ({
        ...prev,
        isScreenReaderEnabled
      }));
    }
  );

  AccessibilityInfo.isBoldTextEnabled().then((isBoldTextEnabled) => {
    setAccessibility((prev: Accessibility) => ({ ...prev, isBoldTextEnabled }));
  });
  AccessibilityInfo.isGrayscaleEnabled().then((isGrayscaleEnabled) => {
    setAccessibility((prev: Accessibility) => ({ ...prev, isGrayscaleEnabled }));
  });
  AccessibilityInfo.isInvertColorsEnabled().then((isInvertColorsEnabled) => {
    setAccessibility((prev: Accessibility) => ({ ...prev, isInvertColorsEnabled }));
  });
  AccessibilityInfo.isReduceMotionEnabled().then((isReduceMotionEnabled) => {
    setAccessibility((prev: Accessibility) => ({ ...prev, isReduceMotionEnabled }));
  });
  AccessibilityInfo.isReduceTransparencyEnabled().then((isReduceTransparencyEnabled) => {
    setAccessibility((prev: Accessibility) => ({ ...prev, isReduceTransparencyEnabled }));
  });
  AccessibilityInfo.isScreenReaderEnabled().then((isScreenReaderEnabled) => {
    setAccessibility((prev: Accessibility) => ({ ...prev, isScreenReaderEnabled }));
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
