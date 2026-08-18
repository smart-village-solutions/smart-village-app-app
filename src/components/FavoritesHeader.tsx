import { DrawerNavigationProp } from 'expo-router/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { consts, texts } from '../config';
import { useTheme } from '../hooks/useTheme';

import { ConfiguredBookmarkIcon } from './bookmarks/BookmarkIcon';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<Record<string, object | undefined>>;
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
      <ConfiguredBookmarkIcon color={colors.darkText} selected style={style} />
    </TouchableOpacity>
  );
};
