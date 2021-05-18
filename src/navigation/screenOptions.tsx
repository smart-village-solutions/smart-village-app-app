import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, device, normalize, texts } from '../config';
import { BookmarkHeader, DiagonalGradient, HeaderLeft, Icon, WrapperRow } from '../components';
import { drawerMenu, favSettings, share } from '../icons';
import { CardStyleInterpolators, StackNavigationOptions } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/core';
import { openShare } from '../helpers';

export const homeScreenOptions = (
  headerRight: boolean
): ((props: {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
}) => StackNavigationOptions) => ({ navigation, route }) => ({
  headerLeft: () => (
    <WrapperRow>
      <TouchableOpacity
        onPress={() => navigation.navigate('Bookmarks', { title: texts.bookmarks.bookmarks })}
        accessibilityLabel="Einstellungen und Lesezeichen (Taste)"
        accessibilityHint="Zu den Einstellungen und Lesezeichen wechseln"
      >
        <Icon
          style={headerRight ? styles.iconLeft : styles.iconRight}
          xml={favSettings(colors.lightestText)}
        />
      </TouchableOpacity>
    </WrapperRow>
  ),
  title: route.params?.title?.length ? route.params?.title : texts.screenTitles.home
});

export const defaultStackNavigatorScreenOptions = (
  headerRight: boolean
): ((props: {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
}) => StackNavigationOptions) => ({ navigation, route }) => ({
  // header gradient:
  // https://stackoverflow.com/questions/44924323/react-navigation-gradient-color-for-header
  headerBackground: () => <DiagonalGradient />,
  headerTitleStyle: {
    color: colors.lightestText,
    fontFamily: device.platform === 'ios' ? 'titillium-web-bold' : 'titillium-web-regular',
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
        accessibilityLabel="Menü Taste"
        accessibilityHint="Navigiert zum Menü"
      >
        <Icon xml={drawerMenu(colors.lightestText)} style={styles.icon} />
      </TouchableOpacity>
    ),
  headerLeft: HeaderLeft,
  title: route.params?.title ?? '',
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS
});

// eslint-disable-next-line complexity
export const detailScreenOptions = (
  headerRight: boolean
): ((props: {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
}) => StackNavigationOptions) => (props) => {
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
        {!!shareContent && (
          <TouchableOpacity
            onPress={() => openShare(shareContent)}
            accessibilityLabel="Teilen Taste"
            accessibilityHint="Inhalte auf der Seite teilen"
          >
            {device.platform === 'ios' ? (
              <Icon
                name="ios-share"
                iconColor={colors.lightestText}
                style={headerRightOption ? styles.iconLeft : styles.iconRight}
              />
            ) : (
              <Icon
                xml={share(colors.lightestText)}
                style={headerRightOption ? styles.iconLeft : styles.iconRight}
              />
            )}
          </TouchableOpacity>
        )}
        {!!headerRightOption && headerRightOption({})}
      </WrapperRow>
    )
  };
};

export const screenOptionsWithSettings = (
  headerRight: boolean
): ((props: {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
}) => StackNavigationOptions) => (props) => {
  const { navigation } = props;

  const defaultOptions = defaultStackNavigatorScreenOptions(headerRight)(props);
  const { headerRight: headerRightOption } = defaultOptions;

  return {
    ...defaultOptions,
    headerRight: () => (
      <WrapperRow style={styles.headerRight}>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings')}
          accessibilityLabel="Einstellungen (Taste)"
          accessibilityHint="Zu den Einstellungen wechseln"
        >
          <Icon
            name={device.platform === 'ios' ? 'ios-settings' : 'md-settings'}
            iconColor={colors.lightestText}
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
): ((props: {
  route: RouteProp<Record<string, any | undefined>, string>;
  navigation: any;
}) => StackNavigationOptions) => (props) => {
  const { route } = props;
  const shareContent = route.params?.shareContent ?? '';

  const defaultOptions = defaultStackNavigatorScreenOptions(headerRight)(props);
  const { headerRight: headerRightOption } = defaultOptions;

  return {
    ...defaultOptions,
    headerRight: () => (
      <WrapperRow style={styles.headerRight}>
        {!!shareContent && (
          <TouchableOpacity
            onPress={() => openShare(shareContent)}
            accessibilityLabel="Teilen Taste"
            accessibilityHint="Inhalte auf der Seite teilen"
          >
            {device.platform === 'ios' ? (
              <Icon
                name="ios-share"
                iconColor={colors.lightestText}
                style={headerRight ? styles.iconLeft : styles.iconRight}
              />
            ) : (
              <Icon
                xml={share(colors.lightestText)}
                style={headerRight ? styles.iconLeft : styles.iconRight}
              />
            )}
          </TouchableOpacity>
        )}
        {!!headerRightOption && headerRightOption({})}
      </WrapperRow>
    )
  };
};

// FIXME: Nav
export const defaultStackNavigatorConfig = (initialRouteName: string, headerRight = true) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: defaultStackNavigatorScreenOptions(headerRight)
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
