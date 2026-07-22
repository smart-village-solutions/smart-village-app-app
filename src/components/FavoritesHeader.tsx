import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { consts, Icon, texts } from '../config';
import { useTheme } from '../hooks/useTheme';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const FavoritesHeader = ({ navigation, style }: Props) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })}
      accessibilityLabel={a11yText.bookmarksIcon}
      accessibilityHint={a11yText.bookmarksHint}
      accessibilityRole="button"
    >
      <Icon.HeartFilled color={colors.darkText} style={style} />
    </TouchableOpacity>
  );
};
