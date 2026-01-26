import React, { createContext, useEffect, useState } from 'react';

import { accessibilityListeners } from './helpers';

/** Baseline accessibility flags so consumers always have defined values. */
const defaultAccessibility = {
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isScreenReaderEnabled: false
};

/** Context exposing the current accessibility features reported by the OS. */
export const AccessibilityContext = createContext(defaultAccessibility);

/**
 * Listens for OS accessibility changes (bold text, grayscale, screen reader, etc.)
 * and exposes the latest flags to the component tree via context.
 */
export const AccessibilityProvider = ({ children }: { children?: React.ReactNode }) => {
  const [accessibility, setAccessibility] = useState(defaultAccessibility);

  useEffect(() => {
    accessibilityListeners(setAccessibility);
  }, []);

  return (
    <AccessibilityContext.Provider value={accessibility}>{children}</AccessibilityContext.Provider>
  );
};
