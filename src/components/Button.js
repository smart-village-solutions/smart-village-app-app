import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, consts, IconSetName, normalize, texts } from '../config';
import { OrientationContext } from '../OrientationProvider';

import { DiagonalGradient } from './DiagonalGradient';

/* eslint-disable complexity */
export const Button = ({
  disabled,
  extraLarge,
  iconName,
  iconPosition,
  invert,
  large,
  medium,
  notFullWidth,
  onPress,
  small,
  title
}) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const needLandscapeStyle =
    notFullWidth ||
    orientation === 'landscape' ||
    dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;
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
        needLandscapeStyle && styles.titleStyleLandscape,
        (extraLarge || large || medium) && styles.spatialButtonTitle,
        small && styles.smallButtonTitle
      ]}
      disabledStyle={styles.buttonStyleDisabled}
      disabledTitleStyle={styles.titleStyle}
      buttonStyle={[
        styles.buttonStyle,
        invert && styles.buttonStyleInvert,
        isDelete && styles.rejectStyle,
        extraLarge && styles.extraLarge,
        large && styles.large,
        medium && styles.medium,
        small && styles.small
      ]}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
      ViewComponent={invert || isDelete || disabled ? undefined : DiagonalGradient}
      useForeground={!invert}
      accessibilityLabel={`${title} ${consts.a11yLabel.button}`}
      disabled={disabled}
      icon={{
        name: iconName,
        type: IconSetName.toLowerCase(),
        containerStyle: {},
        color: invert ? colors.primary : colors.lightestText,
        size: small ? normalize(16) : normalize(24)
      }}
      iconPosition={iconPosition}
    />
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  acceptStyle: {
    backgroundColor: colors.primary
  },
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
  extraLarge: {
    borderRadius: normalize(8),
    height: normalize(56)
  },
  large: {
    borderRadius: normalize(8),
    height: normalize(48)
  },
  medium: {
    borderRadius: normalize(40),
    height: normalize(40)
  },
  rejectStyle: {
    backgroundColor: colors.error
  },
  small: {
    borderRadius: normalize(32),
    height: normalize(32)
  },
  smallButtonTitle: {
    fontSize: normalize(12),
    fontWeight: '600',
    lineHeight: normalize(16)
  },
  spatialButtonTitle: {
    fontSize: normalize(14),
    fontWeight: '600',
    lineHeight: normalize(18)
  },
  titleStyle: {
    color: colors.lightestText,
    fontFamily: 'bold',
    paddingHorizontal: normalize(16)
  },
  titleStyleInvert: {
    color: colors.primary
  },
  titleStyleLandscape: {
    paddingHorizontal: normalize(14)
  }
});

Button.propTypes = {
  disabled: PropTypes.bool,
  extraLarge: PropTypes.bool,
  iconName: PropTypes.object,
  iconPosition: PropTypes.string,
  invert: PropTypes.bool,
  large: PropTypes.bool,
  medium: PropTypes.bool,
  notFullWidth: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  small: PropTypes.bool,
  title: PropTypes.string.isRequired
};

Button.defaultProps = {
  invert: false,
  notFullWidth: false
};
