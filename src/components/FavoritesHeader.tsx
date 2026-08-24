import { DrawerNavigationProp } from 'expo-router/drawer';
import React, { useContext } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { BookmarkContext } from '../BookmarkProvider';
import { consts, texts } from '../config';
import { useTheme } from '../hooks/useTheme';

import { ConfiguredBookmarkIcon } from './bookmarks/BookmarkIcon';
import { HeaderIconButton } from './HeaderIconButton';
import { HEADER_RIGHT_ICON_SIZE } from './headerIconConfig';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const FavoritesHeader = ({ navigation, style }: Props) => {
  const { colors } = useTheme();
  const { bookmarks } = useContext(BookmarkContext);
  const hasBookmarks = Object.values(bookmarks ?? {}).some((items) => items.length > 0);

  return (
    <HeaderIconButton
      onPress={() => navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })}
      accessibilityLabel={a11yText.bookmarksIcon}
      accessibilityHint={a11yText.bookmarksHint}
    >
      <ConfiguredBookmarkIcon
        color={colors.darkText}
        selected={hasBookmarks}
        size={HEADER_RIGHT_ICON_SIZE}
        style={style}
      />
    </HeaderIconButton>
  );
};
