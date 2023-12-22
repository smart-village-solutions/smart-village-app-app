import { RouteProp } from '@react-navigation/core';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import { DiagonalGradient, FavoritesHeader, HeaderLeft, HeaderRight } from '../components';
import { colors, device, normalize } from '../config';

type OptionProps = {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
};

type OptionConfig = {
  withBookmark?: boolean;
  withDelete?: boolean;
  withDrawer?: boolean;
  withFavorites?: boolean;
  withShare?: boolean;
  noHeaderLeft?: boolean;
  cardStyleInterpolator?: StackNavigationOptions['cardStyleInterpolator'];
};

export const getScreenOptions =
  ({
    withBookmark,
    withDelete,
    withDrawer,
    withFavorites,
    withShare,
    noHeaderLeft = false,
    cardStyleInterpolator
  }: OptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    return {
      // header gradient:
      // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
      headerBackground: () => <DiagonalGradient />,
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerTitleContainerStyle: styles.headerTitleContainerStyle,
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            shareContent: route.params?.shareContent,
            withBookmark,
            withDelete,
            withDrawer,
            withShare
          }}
        />
      ),
      headerLeft:
        !noHeaderLeft &&
        (withFavorites
          ? () => <FavoritesHeader navigation={navigation} style={styles.icon} />
          : HeaderLeft),
      title: route.params?.title ?? '',
      cardStyleInterpolator: cardStyleInterpolator ?? CardStyleInterpolators.forHorizontalIOS
    };
  };

const styles = StyleSheet.create({
  headerTitleStyle: {
    color: colors.lightestText,
    fontFamily: device.platform === 'ios' ? 'bold' : 'regular',
    fontSize: normalize(20),
    fontWeight: '400',
    lineHeight: normalize(29)
  },
  headerTitleContainerStyle: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
