import { RouteProp } from '@react-navigation/core';
import { NavigationProp } from '@react-navigation/native';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import {
  AppStatusBar,
  DiagonalGradient,
  FavoritesHeader,
  HeaderLeft,
  HeaderRight
} from '../components';
import type { AppStatusBarProps } from '../components/AppStatusBar';
import { normalize } from '../config';
import { useTheme } from '../hooks/useTheme';
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
  withSearch?: boolean;
  withShare?: boolean;
};

type HeaderBackgroundProps = Pick<
  ScreenOptionConfig,
  'headerBackgroundColor' | 'headerStatusBarStyle'
>;

const HeaderBackground = ({
  headerBackgroundColor,
  headerStatusBarStyle
}: HeaderBackgroundProps) => {
  const { colors } = useTheme();
  const backgroundColor =
    typeof headerBackgroundColor === 'function'
      ? headerBackgroundColor(colors)
      : headerBackgroundColor || colors.surface;
  const barStyle =
    typeof headerStatusBarStyle === 'function'
      ? headerStatusBarStyle(colors)
      : headerStatusBarStyle;

  return (
    <DiagonalGradient colors={[backgroundColor, backgroundColor]}>
      <AppStatusBar backgroundColor={backgroundColor} barStyle={barStyle} />
    </DiagonalGradient>
  );
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
    withSearch,
    withShare
  }: ScreenOptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    return {
      // header gradient:
      // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
      headerBackground: () => (
        <HeaderBackground
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
