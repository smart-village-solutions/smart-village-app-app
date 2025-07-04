import { RouteProp } from '@react-navigation/core';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import { DiagonalGradient, FavoritesHeader, HeaderLeft, HeaderRight } from '../components';
import { colors, normalize } from '../config';

type OptionProps = {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
};

type OptionConfig = {
  cardStyleInterpolator?: StackNavigationOptions['cardStyleInterpolator'];
  noHeaderLeft?: boolean;
  withBookmark?: boolean;
  withDelete?: boolean;
  withDrawer?: boolean;
  withFavorites?: boolean;
  withInfo?: boolean;
  withSearch?: boolean;
  withShare?: boolean;
};

export const getScreenOptions =
  ({
    cardStyleInterpolator,
    noHeaderLeft = false,
    withBookmark,
    withDelete,
    withDrawer,
    withFavorites,
    withInfo,
    withSearch,
    withShare
  }: OptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    return {
      // header gradient:
      // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
      headerBackground: () => <DiagonalGradient />,
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            shareContent: route.params?.shareContent,
            withBookmark,
            withDelete,
            withDrawer,
            withInfo,
            withSearch,
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
    fontFamily: 'condbold',
    fontSize: normalize(18),
    lineHeight: normalize(23)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
