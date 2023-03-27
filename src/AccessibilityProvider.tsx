import React, { createContext, useEffect, useState } from 'react';

import { accessibilityListeners } from './helpers';

const defaultAccessibility = {
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isScreenReaderEnabled: false
};

export const AccessibilityContext = createContext(defaultAccessibility);

export const AccessibilityProvider = ({ children }: { children?: React.ReactNode }) => {
  const [accessibility, setAccessibility] = useState(defaultAccessibility);

  useEffect(() => {
    accessibilityListeners(setAccessibility);
  }, []);

  return (
    <AccessibilityContext.Provider value={accessibility}>{children}</AccessibilityContext.Provider>
  );
};
