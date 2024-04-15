/* eslint-disable complexity */
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
  withInfo?: boolean;
  noHeaderLeft?: boolean;
  cardStyleInterpolator?: StackNavigationOptions['cardStyleInterpolator'];
};

export const getScreenOptions =
  ({
    withBookmark,
    withDrawer,
    withFavorites,
    withShare,
    withInfo,
    noHeaderLeft = false,
    cardStyleInterpolator
  }: OptionConfig): ((props: OptionProps) => StackNavigationOptions) =>
  ({ navigation, route }) => {
    const { orientation } = useContext(OrientationContext);

    const isPortrait = orientation === 'portrait';
    const isSmallerPixelRatio = PixelRatio.get() <= 2;
    const isBiggerPhone = device.width === 414; // for iPhone 11 or iPhone XR
    const isNotBiggerPhoneWithSmallerPixelRatio = !isBiggerPhone && isSmallerPixelRatio;
    const isBiggerPhoneOrBiggerPixelRatio = isBiggerPhone || !isSmallerPixelRatio;

    const headerHeight = !isPortrait
      ? getHeaderHeight('landscape')
      : isPortrait && isBiggerPhoneOrBiggerPixelRatio
      ? normalize(116)
      : isPortrait && isNotBiggerPhoneWithSmallerPixelRatio && normalize(80);

    return {
      headerTitleStyle: styles.headerTitleStyle,
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: colors.secondary,
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
    fontFamily: device.platform === 'ios' ? 'condbold' : 'regular',
    fontSize: normalize(18),
    lineHeight: normalize(23)
  },
  icon: {
    paddingHorizontal: normalize(10)
  }
});
