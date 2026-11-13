import { CardStyleInterpolators } from 'expo-router/build/react-navigation/stack';
import { StackNavigationOptions } from 'expo-router/js-stack';
import { NavigationProp, RouteProp } from 'expo-router/react-navigation';
import React from 'react';
import { StyleSheet } from 'react-native';

import { FavoritesHeader, HeaderLeft, HeaderRight } from '../components';
import type { AppStatusBarProps } from '../components/AppStatusBar';
import { normalize } from '../config';
import { NavigationHeader } from '../components/NavigationHeader';
import { ThemeColorPalette } from '../types/Theme';

type NavigationParams = Record<string, object | undefined>;

type OptionProps = {
  route: RouteProp<NavigationParams, string>;
  navigation: NavigationProp<NavigationParams>;
};

type ThemeValue<T> = T | ((colors: ThemeColorPalette) => T);

export type ScreenOptionConfig = {
  cardStyleInterpolator?: StackNavigationOptions['cardStyleInterpolator'];
  /** A solid header surface, or a resolver for theme-specific app branding. */
  headerBackgroundColor?: ThemeValue<string>;
  /** Overrides automatic contrast for image-based or otherwise custom headers. */
  headerStatusBarStyle?: ThemeValue<AppStatusBarProps['barStyle']>;
  noHeaderLeft?: boolean;
  withBookmark?: boolean;
  withAccessibility?: boolean;
  withDelete?: boolean;
  withDrawer?: boolean;
  withFavorites?: boolean;
  withInfo?: boolean;
  withProfile?: boolean;
  withSearch?: boolean;
  withShare?: boolean;
};

export const getScreenOptions =
  ({
    cardStyleInterpolator,
    headerBackgroundColor,
    headerStatusBarStyle,
    noHeaderLeft = false,
    withBookmark,
    withAccessibility = true,
    withDelete,
    withDrawer,
    withFavorites,
    withInfo,
    withProfile,
    withSearch,
    withShare
  }: ScreenOptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    return {
      header: (props) => (
        <NavigationHeader
          {...props}
          headerBackgroundColor={headerBackgroundColor}
          headerStatusBarStyle={headerStatusBarStyle}
        />
      ),
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
            withProfile,
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
