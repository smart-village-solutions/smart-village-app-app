import PropTypes from 'prop-types';
import React from 'react';
import { View } from 'react-native';

import { normalize } from '../config';
import { useThemeStyles } from '../hooks/useThemeStyles';

import { RegularText } from './Text';

export const ImageRights = ({ imageRights, imageRightsPosition = 'inside-bottom-right' }) => {
  const styles = useThemeStyles(createStyles);

  return (
    <View
      style={[
        styles.containerStyle,
        imageRightsPosition === 'outside-bottom' && styles.imageRightsBottomPositionStyle
      ]}
    >
      {!imageRightsPosition && (
        <RegularText small style={styles.copyrightStyle}>
          ©
        </RegularText>
      )}
      <RegularText style={[!imageRightsPosition ? styles.textStyle : styles.newsTextStyle]}>
        {imageRights}
      </RegularText>
    </View>
  );
};

const createStyles = (colors) => ({
  containerStyle: {
    alignItems: 'center',
    backgroundColor: colors.shadowRgba,
    bottom: 0,
    flexDirection: 'row',
    paddingHorizontal: normalize(4),
    position: 'absolute',
    right: 0
  },

  copyrightStyle: {
    lineHeight: normalize(22), // needs the same line height as `textStyle`
    paddingRight: normalize(1.5),
    paddingTop: normalize(1.5)
  },

  imageRightsBottomPositionStyle: {
    position: 'relative',
    paddingHorizontal: normalize(16),
    backgroundColor: colors.transparent
  },

  newsTextStyle: {
    fontFamily: 'italic'
  },

  textStyle: {
    fontSize: normalize(10)
  }
});

ImageRights.propTypes = {
  imageRights: PropTypes.string.isRequired,
  imageRightsPosition: PropTypes.string
};
