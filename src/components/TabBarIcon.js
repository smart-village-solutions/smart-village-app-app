import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { colors, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

//TODO refactor TabBarIcon to be a function component that can use OrientationContext
export const TabBarIcon = ({ name, focused, style }) => {
  const { orientation } = useContext(OrientationContext);
  const size = orientation === 'landscape' ? normalize(28) : normalize(26);
  const landscapeStyle = orientation === 'landscape' ? style : null;

  return (
    <View style={landscapeStyle}>
      <Ionicons name={name} size={size} color={focused ? colors.accent : colors.primary} />
    </View>
  );
};
const styles = StyleSheet.create({
  marginIcon: {
    marginRight: normalize(10)
  }
});

TabBarIcon.propTypes = {
  name: PropTypes.string.isRequired,
  focused: PropTypes.bool,
  style: PropTypes.object
};

TabBarIcon.defaultProps = {
  style: styles.marginIcon
};
