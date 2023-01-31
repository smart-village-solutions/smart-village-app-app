import PropTypes from 'prop-types';
import React, { createContext, useEffect, useState } from 'react';

import { accessibilityListeners } from './helpers';
import { TAccessibility } from './types';

const defaultAccessibility = {
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isScreenReaderEnabled: false
};

export const AccessibilityContext = createContext({
  accessibility: defaultAccessibility
});

export const AccessibilityProvider = ({ children }: { children?: React.ReactNode }) => {
  const [accessibility, setAccessibility] = useState<TAccessibility>(defaultAccessibility);

  useEffect(() => {
    accessibilityListeners(setAccessibility);
  }, []);

  return (
    <AccessibilityContext.Provider value={{ accessibility }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

AccessibilityProvider.propTypes = {
  children: PropTypes.object.isRequired
};
