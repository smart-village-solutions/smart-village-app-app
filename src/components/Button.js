import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, normalize } from '../config';
import { DiagonalGradient } from './DiagonalGradient';
import { OrientationContext } from '../OrientationProvider';

export const Button = ({ title, onPress }) => {
  const { orientation } = useContext(OrientationContext);
  return (
    <RNEButton
      onPress={onPress}
      title={title}
      titleStyle={styles.titleStyle}
      containerStyle={styles.containerStyle}
      ViewComponent={DiagonalGradient}
      buttonStyle={orientation === 'landscape' && styles.buttonStyleLandscape}
      useForeground
    />
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'titillium-web-bold'
  },
  buttonStyleLandscape: {
    alignSelf: 'center',
    width: '60%'
  },
  containerStyle: {
    marginBottom: normalize(21)
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
