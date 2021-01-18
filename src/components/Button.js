import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { DiagonalGradient } from './DiagonalGradient';
import { OrientationContext } from '../OrientationProvider';

export const Button = ({ title, onPress, invert }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  if (invert) {
    return (
      <RNEButton
        type="outline"
        onPress={onPress}
        title={title}
        titleStyle={[
          styles.titleStyle,
          styles.titleStyleInvert,
          needLandscapeStyle && styles.titleStyleLandscape
        ]}
        buttonStyle={styles.buttonStyleInvert}
        containerStyle={[
          styles.containerStyle,
          needLandscapeStyle && styles.containerStyleLandscape
        ]}
        accessibilityLabel={`${title} (Taste)`}
      />
    );
  }

  return (
    <RNEButton
      onPress={onPress}
      title={title}
      titleStyle={[styles.titleStyle, needLandscapeStyle && styles.titleStyleLandscape]}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
      ViewComponent={DiagonalGradient}
      useForeground
      accessibilityLabel={`${title} (Taste)`}
    />
  );
};

const styles = StyleSheet.create({
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'titillium-web-bold'
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
  invert: PropTypes.bool
};

Button.defaultProps = {
  invert: false
};
