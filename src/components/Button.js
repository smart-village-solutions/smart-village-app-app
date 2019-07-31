import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, normalize } from '../config';
import { DiagonalGradient } from './DiagonalGradient';

export const Button = ({ title, onPress }) => {
  return (
    <RNEButton
      onPress={onPress}
      title={title}
      titleStyle={styles.titleStyle}
      containerStyle={styles.containerStyle}
      ViewComponent={DiagonalGradient}
      useForeground
    />
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'titillium-web-bold'
  },
  containerStyle: {
    marginBottom: normalize(21)
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
