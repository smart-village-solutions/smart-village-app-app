import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { Button as RNEButton } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../config';
import { OrientationContext } from '../OrientationProvider';

import { DiagonalGradient } from './DiagonalGradient';

/* eslint-disable complexity */
export const Button = ({
  big,
  disabled,
  icon,
  iconPosition,
  invert,
  notFullWidth,
  onPress,
  small,
  smallest,
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
        styles.title,
        invert && styles.titleStyleInvert,
        needLandscapeStyle && styles.titleStyleLandscape,
        big && styles.bigTitle,
        small && styles.smallTitle,
        smallest && styles.smallestTitle
      ]}
      disabledStyle={styles.buttonStyleDisabled}
      disabledTitleStyle={styles.titleStyle}
      buttonStyle={[
        styles.button,
        styles.buttonRadius,
        invert && styles.buttonStyleInvert,
        isDelete && styles.rejectStyle,
        big && [styles.bigButton, styles.bigButtonRadius],
        small && [styles.smallButton, styles.smallButtonRadius],
        smallest && [styles.smallestButton, styles.smallestButtonRadius]
      ]}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
      ViewComponent={invert || isDelete || disabled ? undefined : DiagonalGradient}
      useForeground={!invert}
      accessibilityLabel={`${title} ${consts.a11yLabel.button}`}
      disabled={disabled}
      icon={icon}
      iconPosition={iconPosition}
    />
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  acceptStyle: {
    backgroundColor: colors.primary
  },
  bigButton: {
    height: normalize(56)
  },
  bigButtonRadius: {
    borderRadius: normalize(8)
  },
  bigTitle: {
    fontSize: normalize(16),
    lineHeight: normalize(19)
  },
  buttonRadius: {
    borderRadius: normalize(8)
  },
  button: {
    height: normalize(48)
  },
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
  rejectStyle: {
    backgroundColor: colors.error
  },
  smallButton: {
    height: normalize(40)
  },
  smallButtonRadius: {
    borderRadius: normalize(40)
  },
  smallestButton: {
    height: normalize(32)
  },
  smallestButtonRadius: {
    borderRadius: normalize(32)
  },
  smallestTitle: {
    fontSize: normalize(10),
    fontWeight: '600',
    lineHeight: normalize(13)
  },
  smallTitle: {
    fontSize: normalize(12),
    lineHeight: normalize(15)
  },
  title: {
    color: colors.lightestText,
    fontFamily: 'bold',
    fontSize: normalize(14),
    fontWeight: '600',
    lineHeight: normalize(17),
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
  big: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.string,
  invert: PropTypes.bool,
  notFullWidth: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  small: PropTypes.bool,
  smallest: PropTypes.bool,
  title: PropTypes.string.isRequired
};

Button.defaultProps = {
  iconPosition: 'right',
  invert: false,
  notFullWidth: false
};
