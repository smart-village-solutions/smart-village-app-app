import PropTypes from 'prop-types';
import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import { colors, normalize } from '../config';

//TODO refactor TabBarIcon to be a function component that can use OrientationContext
export default function TabBarIcon(props) {
  return (
    <Ionicons
      name={props.name}
      size={normalize(26)}
      color={props.focused ? colors.accent : colors.primary}
    />
  );
}

TabBarIcon.propTypes = {
  name: PropTypes.string.isRequired,
  focused: PropTypes.object
};
