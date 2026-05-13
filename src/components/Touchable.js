import PropTypes from 'prop-types';
import React from 'react';
import { TouchableNativeFeedback, TouchableOpacity } from 'react-native';

import { device } from '../config';

const getAccessibilityState = ({ accessibilityState, checked, disabled, expanded, selected }) => ({
  ...accessibilityState,
  ...(disabled !== undefined ? { disabled } : {}),
  ...(selected !== undefined ? { selected } : {}),
  ...(checked !== undefined ? { checked } : {}),
  ...(expanded !== undefined ? { expanded } : {})
});

export const Touchable = ({
  accessibilityRole = 'button',
  accessibilityState,
  checked,
  disabled,
  expanded,
  selected,
  ...props
}) => {
  const touchableProps = {
    accessibilityRole,
    accessibilityState: getAccessibilityState({
      accessibilityState,
      checked,
      disabled,
      expanded,
      selected
    }),
    disabled,
    ...props
  };

  return device.platform === 'ios' ? (
    <TouchableOpacity {...touchableProps} />
  ) : (
    <TouchableNativeFeedback {...touchableProps} />
  );
};

Touchable.propTypes = {
  accessibilityRole: PropTypes.string,
  accessibilityState: PropTypes.object,
  checked: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  disabled: PropTypes.bool,
  expanded: PropTypes.bool,
  selected: PropTypes.bool
};
