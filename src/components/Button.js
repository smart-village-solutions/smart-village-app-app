import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors } from '../config';
import { DiagonalGradient } from './DiagonalGradient';

export const Button = ({ title, onPress }) => {
  return (
    <RNEButton
      onPress={onPress}
      title={title}
      titleStyle={styles.titleStyle}
      ViewComponent={DiagonalGradient}
    />
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'titillium-web-bold'
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
