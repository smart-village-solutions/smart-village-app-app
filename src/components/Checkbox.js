import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';
import { useOpenWebScreen } from '../hooks';

import { RegularText } from './Text';
import { WrapperHorizontal } from './Wrapper';

export const Checkbox = ({
  title,
  onPress,
  link,
  checkedIcon,
  uncheckedIcon,
  checked,
  center,
  linkDescription,
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
      size={normalize(21)}
      center={center}
      title={
        link ? (
          <WrapperHorizontal>
            <RegularText small>{title} </RegularText>
            <RegularText small primary onPress={() => openWebScreen()}>
              {linkDescription}
            </RegularText>
          </WrapperHorizontal>
        ) : (
          <RegularText small>{title}</RegularText>
        )
      }
      onPress={onPress}
      checkedIcon={checkedIcon}
      checked={checked}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
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
    backgroundColor: colors.lightestText,
    borderWidth: 0,
    marginLeft: 0,
    marginRight: 0
  },
  containerStyleLandscape: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  titleStyle: {
    color: colors.darkText
  }
});

Checkbox.propTypes = {
  title: PropTypes.string.isRequired,
  onPress: PropTypes.func.isRequired,
  link: PropTypes.string,
  checkedIcon: PropTypes.string,
  uncheckedIcon: PropTypes.string,
  disabled: PropTypes.bool,
  checked: PropTypes.bool,
  center: PropTypes.bool,
  linkDescription: PropTypes.string
};

CheckBox.defaultProps = {
  checkedIcon: 'dot-circle-o',
  uncheckedIcon: 'circle-o'
};
