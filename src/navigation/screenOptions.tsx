import { RouteProp } from '@react-navigation/core';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import {
  BookmarkHeader,
  DiagonalGradient,
  DrawerHeader,
  FavSettingsHeader,
  HeaderLeft,
  SettingsHeader,
  ShareHeader,
  WrapperRow
} from '../components';
import { colors, device, normalize } from '../config';

type OptionProps = {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
};

type OptionConfig = {
  withBookmark?: boolean;
  withDrawer?: boolean;
  withSettings?: boolean;
  withFavSettings?: boolean;
  withShare?: boolean;
};

export const getScreenOptions = ({
  withBookmark,
  withDrawer,
  withSettings,
  withFavSettings,
  withShare
}: OptionConfig): ((props: OptionProps) => StackNavigationOptions) => ({ navigation, route }) => {
  const shareContent = route.params?.shareContent ?? '';

  return {
    // header gradient:
    // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
    headerBackground: () => <DiagonalGradient />,
    headerTitleStyle: {
      color: colors.lightestText,
      fontFamily: device.platform === 'ios' ? 'bold' : 'regular',
      fontSize: normalize(20),
      fontWeight: '400',
      lineHeight: normalize(29)
    },
    headerTitleContainerStyle: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'flex-start'
    },
    headerRight: () => (
      <WrapperRow style={styles.headerRight}>
        {withBookmark && <BookmarkHeader route={route} style={styles.icon} />}
        {withShare && <ShareHeader shareContent={shareContent} style={styles.icon} />}
        {withSettings && <SettingsHeader navigation={navigation} style={styles.icon} />}
        {withDrawer && <DrawerHeader navigation={navigation} style={styles.icon} />}
      </WrapperRow>
    ),
    headerLeft: withFavSettings
      ? () => <FavSettingsHeader navigation={navigation} style={styles.icon} />
      : HeaderLeft,
    title: route.params?.title ?? '',
    cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
  };
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center',
    paddingRight: normalize(7)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
