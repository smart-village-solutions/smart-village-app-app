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
      containerStyle={
        orientation === 'landscape' ? styles.containerStyleLandscape : styles.containerStyle
      }
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
  containerStyleLandscape: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: normalize(21)
  },
  containerStyle: {
    marginBottom: normalize(21)
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired
};
