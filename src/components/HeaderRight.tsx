import { DrawerNavigationProp } from '@react-navigation/drawer';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { ShareContent, StyleSheet } from 'react-native';

import { normalize } from '../config';

import { BookmarkHeader } from './bookmarks';
import { CalendarHeader } from './CalendarHeader';
import { ChatHeader } from './ChatHeader';
import { DeleteHeader } from './DeleteHeader';
import { DrawerHeader } from './DrawerHeader';
import { EditHeader } from './EditHeader';
import { GroupHeader } from './GroupHeader';
import { InfoHeader } from './InfoHeader';
import { SearchHeader } from './SearchHeader';
import { ShareHeader } from './ShareHeader';
import { WrapperRow } from './Wrapper';

type Props = {
  navigation: StackNavigationProp<any> & DrawerNavigationProp<any>;
  onPress?: () => void;
  route: RouteProp<any, string>;
  shareContent?: ShareContent;
  withBookmark?: boolean;
  withCalendar?: boolean;
  withChat?: boolean;
  withDelete?: boolean;
  withDrawer?: boolean;
  withEdit?: boolean;
  withGroup?: boolean;
  withInfo?: boolean;
  withSearch?: boolean;
  withShare?: boolean;
};

/* eslint-disable complexity */
export const HeaderRight = ({
  navigation,
  onPress,
  route,
  shareContent = route.params?.shareContent,
  withBookmark = false,
  withCalendar = false,
  withChat = false,
  withDelete = false,
  withDrawer = false,
  withEdit = false,
  withGroup = false,
  withInfo = false,
  withSearch = false,
  withShare = false
}: Props) => (
  <WrapperRow style={styles.headerRight}>
    {withBookmark && <BookmarkHeader route={route} style={styles.icon} />}
    {withCalendar && <CalendarHeader navigation={navigation} style={styles.icon} />}
    {withChat && <ChatHeader navigation={navigation} style={styles.icon} />}
    {withDelete && <DeleteHeader onPress={onPress} style={styles.icon} />}
    {withDrawer && <DrawerHeader navigation={navigation} style={styles.icon} />}
    {withEdit && <EditHeader onPress={onPress} style={styles.icon} />}
    {withGroup && <GroupHeader navigation={navigation} style={styles.icon} />}
    {withInfo && <InfoHeader route={route} style={styles.icon} />}
    {withSearch && <SearchHeader navigation={navigation} style={styles.icon} />}
    {withShare && <ShareHeader shareContent={shareContent} style={styles.icon} />}
  </WrapperRow>
);
/* eslint-enable complexity */

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(8)
  },
  icon: {
    paddingHorizontal: normalize(6)
  }
});
