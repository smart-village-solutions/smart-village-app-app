import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import React from 'react';
import { ShareContent, StyleSheet } from 'react-native';

import { normalize } from '../config';

import { BookmarkHeader } from './bookmarks';
import { ChatHeader } from './ChatHeader';
import { DrawerHeader } from './DrawerHeader';
import { EditHeader } from './EditHeader';
import { ShareHeader } from './ShareHeader';
import { WrapperRow } from './Wrapper';

type Props = {
  navigation: DrawerNavigationProp<any>;
  onPress?: () => void;
  route: RouteProp<any, string>;
  shareContent?: ShareContent;
  withBookmark?: boolean;
  withChat?: boolean;
  withDrawer?: boolean;
  withEdit?: boolean;
  withShare?: boolean;
};

export const HeaderRight = ({
  navigation,
  onPress,
  route,
  shareContent = route.params?.shareContent,
  withBookmark = false,
  withChat = false,
  withDrawer = false,
  withEdit = false,
  withShare = false
}: Props) => (
  <WrapperRow style={styles.headerRight}>
    {withBookmark && <BookmarkHeader route={route} style={styles.icon} />}
    {withChat && <ChatHeader onPress={onPress} style={styles.icon} />}
    {withEdit && <EditHeader onPress={onPress} style={styles.icon} />}
    {withShare && <ShareHeader shareContent={shareContent} style={styles.icon} />}
    {withDrawer && <DrawerHeader navigation={navigation} style={styles.icon} />}
  </WrapperRow>
);

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
