import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, colors, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';

export const SueImageFallback = ({ style }: { style?: any }) => {
  return (
    <View style={[styles.container, stylesForImage().defaultStyle, style]}>
      <Icon.SueBroom color={colors.placeholder} size={normalize(32)} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: colors.gray20,
    justifyContent: 'center'
  }
});

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesForImage = () => {
  const width = imageWidth();

  return StyleSheet.create({
    defaultStyle: {
      height: imageHeight(width),
      width
    }
  });
};
/* eslint-enable react-native/no-unused-styles */
