import React from 'react';
import { StyleSheet, View } from 'react-native';

import { Icon, normalize } from '../../config';
import { imageHeight, imageWidth } from '../../helpers';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

export const SueImageFallback = ({ style }: { style?: any }) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  return (
    <View style={[styles.container, stylesForImage().defaultStyle, style]}>
      <Icon.SueBroom color={colors.placeholder} size={normalize(32)} />
    </View>
  );
};

const createStyles = (colors) => ({
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
