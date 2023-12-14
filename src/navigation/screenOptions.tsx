import { RouteProp } from '@react-navigation/core';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { PixelRatio, StyleSheet } from 'react-native';

import { OrientationContext } from '../OrientationProvider';
import { FavoritesHeader, HeaderLeft, HeaderRight } from '../components';
import { colors, device, normalize } from '../config';
import { getHeaderHeight } from '../helpers';

type OptionProps = {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
};

type OptionConfig = {
  withBookmark?: boolean;
  withDrawer?: boolean;
  withFavorites?: boolean;
  withShare?: boolean;
  noHeaderLeft?: boolean;
  cardStyleInterpolator?: StackNavigationOptions['cardStyleInterpolator'];
};

export const getScreenOptions =
  ({
    withBookmark,
    withDrawer,
    withFavorites,
    withShare,
    noHeaderLeft = false,
    cardStyleInterpolator
  }: OptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    const { orientation } = useContext(OrientationContext);

    const headerHeight =
      orientation === 'portrait' && PixelRatio.get() === 2
        ? normalize(80)
        : orientation === 'portrait' && PixelRatio.get() > 2
        ? normalize(116)
        : orientation === 'landscape' && PixelRatio.get() === 2
        ? getHeaderHeight('landscape')
        : getHeaderHeight('landscape');

    return {
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.borderRgba,
        height: headerHeight
      },
      headerRight: () => (
        <HeaderRight
          {...{
            navigation,
            route,
            shareContent: route.params?.shareContent,
            withBookmark,
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
    color: colors.darkText,
    fontFamily: device.platform === 'ios' ? 'condbold' : 'regular',
    fontSize: normalize(18),
    lineHeight: normalize(23)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
