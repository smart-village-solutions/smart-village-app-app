import { RouteProp } from '@react-navigation/core';
import { NavigationProp } from '@react-navigation/native';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import { DiagonalGradient, FavoritesHeader, HeaderLeft, HeaderRight } from '../components';
import { normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

type NavigationParams = Record<string, object | undefined>;

type OptionProps = {
  route: RouteProp<NavigationParams, string>;
  navigation: NavigationProp<NavigationParams>;
};

type OptionConfig = {
  cardStyleInterpolator?: StackNavigationOptions['cardStyleInterpolator'];
  noHeaderLeft?: boolean;
  withBookmark?: boolean;
  withAccessibility?: boolean;
  withDelete?: boolean;
  withDrawer?: boolean;
  withFavorites?: boolean;
  withInfo?: boolean;
  withSearch?: boolean;
  withShare?: boolean;
};

const HeaderBackground = () => {
  const { colors } = useTheme();

  return <DiagonalGradient colors={[colors.surface, colors.surface]} />;
};

export const getScreenOptions =
  ({
    cardStyleInterpolator,
    noHeaderLeft = false,
    withBookmark,
    withAccessibility = true,
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
      headerBackground: HeaderBackground,
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            shareContent: route.params?.shareContent,
            withAccessibility,
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
    fontFamily: 'condbold',
    fontSize: normalize(18),
    lineHeight: normalize(23)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
