import { DrawerNavigationProp } from 'expo-router/drawer';
import React, { useContext } from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { BookmarkContext } from '../BookmarkProvider';
import { consts, texts } from '../config';
import { useHeaderForeground } from '../hooks/useHeaderForeground';

import { ConfiguredBookmarkIcon } from './bookmarks/BookmarkIcon';
import { HeaderIconButton } from './HeaderIconButton';
import { HEADER_RIGHT_ICON_SIZE } from './headerIconConfig';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const FavoritesHeader = ({ navigation, style }: Props) => {
  const foreground = useHeaderForeground();
  const { bookmarks } = useContext(BookmarkContext);
  const hasBookmarks = Object.values(bookmarks ?? {}).some((items) => items.length > 0);

  return (
    <HeaderIconButton
      onPress={() => navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })}
      accessibilityLabel={a11yText.bookmarksIcon}
      accessibilityHint={a11yText.bookmarksHint}
    >
      <ConfiguredBookmarkIcon
        color={foreground}
        selected={hasBookmarks}
        size={HEADER_RIGHT_ICON_SIZE}
        style={style}
      />
    </HeaderIconButton>
  );
};
