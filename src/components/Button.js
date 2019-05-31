import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors } from '../config';

export const Button = ({ title, onPress }) => {
  return (
    <RNEButton
      type="outline"
      onPress={onPress}
      title={title}
      titleStyle={styles.titleStyle}
      buttonStyle={styles.buttonStyle}
    />
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.primary,
    fontFamily: 'titillium-web-bold'
  },
  buttonStyle: {
    borderColor: colors.primary
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
