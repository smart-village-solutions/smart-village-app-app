import PropTypes from 'prop-types';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, normalize } from '../config';

import { RegularText } from './Text';

export const ImageRights = ({ imageRights, isNews }) => (
  <View style={[styles.containerStyle, isNews && styles.isNewsStyle]}>
    {!isNews && (
      <RegularText small style={styles.copyrightStyle}>
        ©
      </RegularText>
    )}
    <RegularText style={[!isNews ? styles.textStyle : styles.newsTextStyle]}>
      {imageRights}
    </RegularText>
  </View>
);

const styles = StyleSheet.create({
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
  isNewsStyle: {
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
  isNews: PropTypes.bool
};
