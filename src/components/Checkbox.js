import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';

import { colors, consts, normalize, texts } from '../config';
import { useOpenWebScreen } from '../hooks';
import { OrientationContext } from '../OrientationProvider';

import { BoldText, RegularText } from './Text';
import { WrapperHorizontal } from './Wrapper';

const { a11yLabel } = consts;

export const Checkbox = ({
  boldTitle = false,
  center = undefined,
  checked,
  checkedIcon = 'dot-circle-o',
  containerStyle,
  lightest = false,
  link = undefined,
  linkDescription = undefined,
  onPress,
  title,
  uncheckedIcon = 'circle-o',
  ...props
}) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;
  const headerTitle = title ?? '';
  const rootRouteName = '';
  const openWebScreen = useOpenWebScreen(headerTitle, link, rootRouteName);

  return (
    <CheckBox
      accessibilityRole="button"
      accessibilityLabel={`${a11yLabel.checkbox} (${
        checked
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      }) ${title}`}
      accessibilityValue={
        checked
          ? texts.accessibilityLabels.checkbox.active
          : texts.accessibilityLabels.checkbox.inactive
      }
      size={normalize(21)}
      center={center}
      title={
        <WrapperHorizontal>
          {boldTitle ? (
            <BoldText small lightest={lightest}>
              {title}
            </BoldText>
          ) : (
            <RegularText small lightest={lightest}>
              {title}
            </RegularText>
          )}
          {link && (
            <RegularText small primary onPress={openWebScreen}>
              {linkDescription}
            </RegularText>
          )}
        </WrapperHorizontal>
      }
      onPress={onPress}
      checkedIcon={checkedIcon}
      checked={checked}
      containerStyle={[
        styles.containerStyle,
        needLandscapeStyle && styles.containerStyleLandscape,
        containerStyle
      ]}
      uncheckedIcon={uncheckedIcon}
      textStyle={styles.titleStyle}
      checkedColor={colors.primary}
      uncheckedColor={colors.darkText}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    backgroundColor: colors.surface,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  containerStyleLandscape: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleStyle: {
    color: colors.darkText,
    fontWeight: 'normal'
  }
});

Checkbox.propTypes = {
  boldTitle: PropTypes.bool,
  center: PropTypes.bool,
  checked: PropTypes.bool,
  checkedIcon: PropTypes.string,
  containerStyle: PropTypes.object,
  disabled: PropTypes.bool,
  lightest: PropTypes.bool,
  link: PropTypes.string,
  linkDescription: PropTypes.string,
  onPress: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  uncheckedIcon: PropTypes.string
};
