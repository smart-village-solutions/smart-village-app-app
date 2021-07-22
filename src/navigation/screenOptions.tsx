import { RouteProp } from '@react-navigation/core';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import {
  BookmarkHeader,
  DiagonalGradient,
  HeaderLeft,
  ShareHeader,
  WrapperRow
} from '../components';
import { colors, consts, device, Icon, normalize, texts } from '../config';

type OptionProps = {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
};

const a11yText = consts.a11yLabel;

export const homeScreenOptions = (
  headerRight: boolean
): ((props: OptionProps) => StackNavigationOptions) => ({ navigation, route }) => ({
  headerLeft: () => (
    <WrapperRow>
      <TouchableOpacity
        onPress={() => navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })}
        accessibilityLabel={a11yText.settingsBookmarksIcon}
        accessibilityHint={a11yText.settingsBookmarksHint}
      >
        <Icon.FavSettings
          color={colors.lightestText}
          style={headerRight ? styles.iconLeft : styles.iconRight}
        />
      </TouchableOpacity>
    </WrapperRow>
  ),
  title: route.params?.title?.length ? route.params?.title : texts.screenTitles.home
});

export const defaultStackNavigatorScreenOptions = (
  headerRight: boolean
): ((props: OptionProps) => StackNavigationOptions) => ({ navigation, route }) => ({
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
  headerRight: () =>
    headerRight && (
      <TouchableOpacity
        onPress={() => navigation.openDrawer()}
        accessibilityLabel={a11yText.openMenuIcon}
        accessibilityHint={a11yText.openMenuHint}
      >
        <Icon.DrawerMenu color={colors.lightestText} style={styles.icon} />
      </TouchableOpacity>
    ),
  headerLeft: HeaderLeft,
  title: route.params?.title ?? '',
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
});

// eslint-disable-next-line complexity
export const detailScreenOptions = (
  headerRight: boolean
): ((props: OptionProps) => StackNavigationOptions) => (props) => {
  const { route } = props;
  const shareContent = route.params?.shareContent ?? '';
  const suffix = route.params?.suffix ?? '';
  const query = route.params?.query ?? '';
  const queryVariables = route.params?.queryVariables ?? {};

  const defaultOptions = defaultStackNavigatorScreenOptions(headerRight)(props);
  const { headerRight: headerRightOption } = defaultOptions;

  const StyledBookmarkHeader =
    query && queryVariables?.id ? (
      <BookmarkHeader
        id={queryVariables.id}
        suffix={suffix}
        query={query}
        style={styles.iconLeft}
      />
    ) : null;

  return {
    ...defaultOptions,
    headerRight: () => (
      <WrapperRow style={styles.headerRight}>
        {StyledBookmarkHeader}
        <ShareHeader headerRight={headerRight} shareContent={shareContent} />
        {!!headerRightOption && headerRightOption({})}
      </WrapperRow>
    )
  };
};

export const screenOptionsWithSettings = (
  headerRight: boolean
): ((props: OptionProps) => StackNavigationOptions) => (props) => {
  const { navigation } = props;

  const defaultOptions = defaultStackNavigatorScreenOptions(headerRight)(props);
  const { headerRight: headerRightOption } = defaultOptions;

  return {
    ...defaultOptions,
    headerRight: () => (
      <WrapperRow style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel={a11yText.settingsIcon}
          accessibilityHint={a11yText.settingsIconHint}
        >
          <Icon.Settings
            color={colors.lightestText}
            style={headerRight ? styles.iconLeft : styles.iconRight}
          />
        </TouchableOpacity>
        {!!headerRightOption && headerRightOption({})}
      </WrapperRow>
    )
  };
};

export const screenOptionsWithShare = (
  headerRight: boolean
): ((props: OptionProps) => StackNavigationOptions) => (props) => {
  const { route } = props;
  const shareContent = route.params?.shareContent ?? '';

  const defaultOptions = defaultStackNavigatorScreenOptions(headerRight)(props);
  const { headerRight: headerRightOption } = defaultOptions;

  return {
    ...defaultOptions,
    headerRight: () => (
      <WrapperRow style={styles.headerRight}>
        <ShareHeader headerRight={headerRight} shareContent={shareContent} />
        {!!headerRightOption && headerRightOption({})}
      </WrapperRow>
    )
  };
};

const styles = StyleSheet.create({
  headerRight: {
    alignItems: 'center'
  },
  icon: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(4)
  },
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  }
});
