import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { colors, device } from '../config';

const trackColor = {
  ...Platform.select({
    android: { false: colors.gray20, true: colors.lighterSecondary },
    ios: { false: colors.gray20, true: colors.lighterSecondary }
  })
};
const thumbColor = colors.lightestText;
const thumbColorEnabled = Platform.select({
  android: colors.secondary,
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
      style={[
        device.platform === 'ios' &&
          !device.isTablet && {
            right: -6,
            transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }]
          }
      ]}
    />
  );
};

Switch.propTypes = {
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};
