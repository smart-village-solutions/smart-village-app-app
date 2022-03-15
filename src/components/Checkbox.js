import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { CheckBox } from 'react-native-elements';

import { colors, consts, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

import { Link } from '.';

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

  if (link) {
    return (
      <>
        <CheckBox
          size={normalize(21)}
          center={center}
          title={title}
          onPress={onPress}
          checkedIcon={checkedIcon}
          checked={checked}
          containerStyle={[
            styles.containerStyle,
            needLandscapeStyle && styles.containerStyleLandscape
          ]}
          uncheckedIcon={uncheckedIcon}
          textStyle={styles.titleStyle}
          checkedColor={colors.primary}
          {...props}
        />
        <Link description={linkDescription} url={link} />
      </>
    );
  }

  return (
    <CheckBox
      size={normalize(21)}
      center={center}
      title={title}
      onPress={onPress}
      checkedIcon={checkedIcon}
      checked={checked}
      containerStyle={[styles.containerStyle, needLandscapeStyle && styles.containerStyleLandscape]}
      uncheckedIcon={uncheckedIcon}
      textStyle={styles.titleStyle}
      checkedColor={colors.primary}
    />
  );
};

const styles = StyleSheet.create({
  containerStyle: {
    marginBottom: normalize(21)
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
