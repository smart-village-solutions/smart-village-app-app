import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, device, normalize } from '../config';
import { DiagonalGradient, HeaderLeft, Icon } from '../components';
import { drawerMenu } from '../icons';
import { CardStyleInterpolators } from '@react-navigation/stack';

export const defaultStackNavigatorScreenOptions = (headerRight) => ({ navigation, route }) => ({
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

// FIXME: Nav
export const defaultStackNavigatorConfig = (initialRouteName, headerRight = true) => {
  return {
    initialRouteName,
    URIPrefix: 'smart-village-app://',
    defaultNavigationOptions: defaultStackNavigatorScreenOptions(headerRight)
  };
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14),
    paddingVertical: normalize(4)
  }
});
