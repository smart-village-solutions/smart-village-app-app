/* eslint-disable complexity */
import { RouteProp } from '@react-navigation/core';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrientationContext } from '../OrientationProvider';
import { DiagonalGradient, FavoritesHeader, HeaderLeft, HeaderRight } from '../components';
import { colors, normalize } from '../config';

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
  withInfo?: boolean;
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
    withInfo,
    noHeaderLeft = false,
    cardStyleInterpolator
  }: OptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    const insets = useSafeAreaInsets();
    const { orientation } = useContext(OrientationContext);
    const isPortrait = orientation === 'portrait';
    const headerHeight = !isPortrait ? normalize(35) + insets.top : normalize(56) + insets.top;

    return {
      // header gradient:
      // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
      headerBackground: () => <DiagonalGradient colors={[colors.surface, colors.surface]} />,
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: {
        height: headerHeight
      },
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            shareContent: route.params?.shareContent,
            withBookmark,
            withDelete,
            withDrawer,
            withShare,
            withInfo
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

/* eslint-enable complexity */

const styles = StyleSheet.create({
  headerTitleStyle: {
    color: colors.darkText,
    fontFamily: 'condbold',
    fontSize: normalize(18),
    lineHeight: normalize(23)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
