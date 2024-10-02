import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors } from '../config';

const trackColor = {
  ...Platform.select({
    android: { false: colors.shadow, true: colors.primary },
    ios: { false: colors.shadow, true: colors.primary }
  })
};
const thumbColor = Platform.select({
  android: colors.gray20,
  ios: colors.lightestText
});
const thumbColorEnabled = Platform.select({
  android: colors.gray20,
  ios: colors.lightestText
});

export const Switch = ({ switchValue, toggleSwitch }) => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);

  return (
    <RNSwitch
      trackColor={trackColor}
      thumbColor={switchValue ? thumbColorEnabled : thumbColor}
      ios_backgroundColor={isReduceTransparencyEnabled ? colors.overlayRgba : colors.shadow}
      onValueChange={toggleSwitch}
      value={switchValue}
      accessibilityRole="button"
    />
  );
};

Switch.propTypes = {
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};
