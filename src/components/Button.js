import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../config';
import { OrientationContext } from '../OrientationProvider';

import { DiagonalGradient } from './DiagonalGradient';

/* eslint-disable complexity */
export const Button = ({ title, onPress, invert, disabled }) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;
  const isAccept = title === texts.volunteer.accept;
  const isReject = title === texts.volunteer.reject;

  if (isAccept || isReject) {
    return (
      <RNEButton
        onPress={onPress}
        title={title}
        titleStyle={[styles.titleStyle, needLandscapeStyle && styles.titleStyleLandscape]}
        buttonStyle={[
          styles.buttonStyle,
          isAccept && styles.acceptStyle,
          isReject && styles.rejectStyle
        ]}
        containerStyle={[needLandscapeStyle && styles.containerStyleLandscape]}
        useForeground
        accessibilityLabel={`${title} ${consts.a11yLabel.button}`}
      />
    );
  }

  const isDelete = title === texts.volunteer.delete;

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
      buttonStyle={[
        styles.buttonStyle,
        invert && styles.buttonStyleInvert,
        isDelete && styles.rejectStyle
      ]}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
      ViewComponent={invert || isDelete || disabled ? undefined : DiagonalGradient}
      useForeground={!invert}
      accessibilityLabel={`${title} ${consts.a11yLabel.button}`}
      disabled={disabled}
    />
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  buttonStyle: {},
  buttonStyleDisabled: {
    backgroundColor: colors.placeholder
  },
  buttonStyleInvert: {
    borderColor: colors.primary,
    borderStyle: 'solid',
    borderWidth: 2
  },
  containerStyle: {
    marginBottom: normalize(21)
  },
  containerStyleLandscape: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'bold'
  },
  titleStyleInvert: {
    color: colors.primary
  },
  titleStyleLandscape: {
    paddingHorizontal: normalize(14)
  },
  acceptStyle: {
    backgroundColor: colors.primary
  },
  rejectStyle: {
    backgroundColor: colors.error
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
