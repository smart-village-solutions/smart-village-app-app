import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { device } from '../config';
import { useTheme } from '../hooks/useTheme';

export const Switch = ({ accessibilityLabel, isDisabled, switchValue, toggleSwitch }) => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);
  const { colors } = useTheme();
  const trackColor = Platform.select({
    android: { false: colors.shadow, true: colors.primary },
    ios: { false: colors.shadow, true: colors.primary }
  });
  const thumbColor = Platform.select({ android: colors.gray20, ios: colors.onPrimary });
  const disabledThumbColor = Platform.select({ android: colors.gray40, ios: colors.onPrimary });

  return (
    <RNSwitch
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: switchValue, disabled: isDisabled }}
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
      thumbColor={isDisabled ? disabledThumbColor : thumbColor}
      trackColor={trackColor}
      value={switchValue}
    />
  );
};

Switch.propTypes = {
  accessibilityLabel: PropTypes.string,
  isDisabled: PropTypes.bool,
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};
