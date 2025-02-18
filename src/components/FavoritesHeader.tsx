import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, texts } from '../config';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const FavoritesHeader = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })}
      accessibilityLabel={a11yText.bookmarksIcon}
      accessibilityHint={a11yText.bookmarksHint}
    >
      <Icon.HeartFilled color={colors.darkText} style={style} />
    </TouchableOpacity>
  );
};
