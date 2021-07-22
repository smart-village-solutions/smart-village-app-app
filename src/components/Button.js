import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

import { DiagonalGradient } from './DiagonalGradient';

export const Button = ({ title, onPress, invert, disabled }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  return (
    <RNEButton
      type={invert ? 'outline' : undefined}
      onPress={onPress}
      title={title}
      titleStyle={[
        styles.titleStyle,
        invert && styles.titleStyleInvert,
        needLandscapeStyle && styles.titleStyleLandscape
      ]}
      disabledStyle={styles.buttonStyleDisabled}
      disabledTitleStyle={styles.titleStyle}
      buttonStyle={invert ? styles.buttonStyleInvert : undefined}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
      ViewComponent={invert || disabled ? undefined : DiagonalGradient}
      useForeground={!invert}
      accessibilityLabel={`${title} ${consts.a11yLabel.button}`}
      disabled={disabled}
    />
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'bold'
  },
  titleStyleLandscape: {
    paddingHorizontal: normalize(14)
  },
  containerStyle: {
    marginBottom: normalize(21)
  },
  titleStyleInvert: {
    color: colors.primary
  },
  buttonStyleDisabled: {
    backgroundColor: colors.placeholder
  },
  buttonStyleInvert: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    borderWidth: 2
  },
  containerStyleLandscape: {
    alignItems: 'center',
    justifyContent: 'center'
  }
});

Button.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  invert: PropTypes.bool,
  disabled: PropTypes.bool
};

Button.defaultProps = {
  invert: false
};
