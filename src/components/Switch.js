import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, device } from '../config';

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

export const Switch = ({ isDisabled, switchValue, toggleSwitch }) => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);

  return (
    <RNSwitch
      accessibilityRole="button"
      disabled={isDisabled}
      ios_backgroundColor={isReduceTransparencyEnabled ? colors.overlayRgba : colors.shadow}
      onValueChange={toggleSwitch}
      style={[
        device.platform === 'ios' &&
          !device.isTablet && {
            right: -6,
            transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }]
          }
      ]}
      thumbColor={switchValue ? thumbColorEnabled : thumbColor}
      trackColor={trackColor}
      value={switchValue}
    />
  );
};

Switch.propTypes = {
  isDisabled: PropTypes.bool,
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};
