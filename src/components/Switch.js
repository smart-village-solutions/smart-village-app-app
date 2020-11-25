import PropTypes from 'prop-types';
import React from 'react';
import { Platform, Switch as RNSwitch } from 'react-native';

import { colors } from '../config';

const trackColor = {
  ...Platform.select({
    android: { false: colors.shadow, true: colors.lighterPrimary },
    ios: { false: colors.shadow, true: colors.primary }
  })
};
const thumbColor = colors.lightestText;
const thumbColorEnabled = Platform.select({
  android: colors.primary,
  ios: colors.lightestText
});

export const Switch = ({ switchValue, toggleSwitch }) => (
  <RNSwitch
    trackColor={trackColor}
    thumbColor={switchValue ? thumbColorEnabled : thumbColor}
    ios_backgroundColor={colors.shadow}
    onValueChange={toggleSwitch}
    value={switchValue}
  />
);

Switch.propTypes = {
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};
