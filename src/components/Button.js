import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet, View } from 'react-native';
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
        titleStyle={[styles.title, needLandscapeStyle && styles.titleLandscape]}
        buttonStyle={[
          styles.button,
          isAccept && styles.acceptButton,
          isReject && styles.rejectButton
        ]}
        containerStyle={[needLandscapeStyle && styles.containerLandscape]}
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
        invert && styles.titleInvert,
        needLandscapeStyle && styles.titleLandscape,
        big && styles.bigTitle,
        small && styles.smallTitle,
        smallest && styles.smallestTitle
      ]}
      disabledStyle={styles.buttonDisabled}
      disabledTitleStyle={styles.title}
      buttonStyle={[
        styles.button,
        styles.buttonRadius,
        invert && styles.buttonInvert,
        !invert && isDelete && styles.rejectButton,
        big && [styles.bigButton, styles.bigButtonRadius],
        small && [styles.smallButton, styles.smallButtonRadius],
        smallest && [styles.smallestButton, styles.smallestButtonRadius]
      ]}
      containerStyle={[styles.container, needLandscapeStyle && styles.containerLandscape]}
      ViewComponent={invert || isDelete || disabled ? undefined : DiagonalGradient}
      useForeground={!invert}
      accessibilityLabel={`${title} ${consts.a11yLabel.button}`}
      disabled={disabled}
      icon={
        !!icon && (
          <View
            style={[
              iconPosition === 'left' && styles.iconLeft,
              iconPosition === 'right' && styles.iconRight,
              needLandscapeStyle && iconPosition === 'left' && styles.landscapeIconLeft,
              needLandscapeStyle && iconPosition === 'right' && styles.landscapeIconRight
            ]}
          >
            {icon}
          </View>
        )
      }
      iconPosition={iconPosition}
    />
  );
};
/* eslint-enable complexity */

const styles = StyleSheet.create({
  acceptButton: {
    backgroundColor: colors.primary
  },
  bigButton: {
    height: normalize(56)
  },
  bigButtonRadius: {
    borderRadius: normalize(8)
  },
  bigTitle: {
    fontSize: normalize(14)
  },
  button: {
    height: normalize(48)
  },
  buttonDisabled: {
    backgroundColor: colors.placeholder
  },
  buttonInvert: {
    backgroundColor: colors.transparent,
    borderColor: colors.primary,
    borderStyle: 'solid',
    borderWidth: normalize(1)
  },
  buttonRadius: {
    borderRadius: normalize(8)
  },
  container: {
    marginBottom: normalize(16)
  },
  containerLandscape: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconLeft: {
    paddingRight: normalize(8)
  },
  iconRight: {
    paddingLeft: normalize(8)
  },
  landscapeIconLeft: {
    marginRight: normalize(-14),
    paddingLeft: normalize(14)
  },
  landscapeIconRight: {
    marginLeft: normalize(-14),
    paddingRight: normalize(14)
  },
  rejectButton: {
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
    fontSize: normalize(12)
  },
  smallTitle: {
    fontSize: normalize(14)
  },
  title: {
    color: colors.lightestText,
    fontFamily: 'bold',
    fontSize: normalize(14),
    fontWeight: '600'
  },
  titleInvert: {
    color: colors.primary
  },
  titleLandscape: {
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
