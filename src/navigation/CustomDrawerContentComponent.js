import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';

import { DiagonalGradient, SafeAreaViewFlex } from '../components';
import { colors, consts } from '../config';
import { getHeaderHeight, statusBarHeight } from '../helpers';
import { OrientationContext } from '../OrientationProvider';

import DrawerNavigatorItems from './DrawerNavigatorItems';

/**
 * based on the default content component from React Navigation:
 *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/navigators/createDrawerNavigator.tsx
 */
export const CustomDrawerContentComponent = ({ navigation, drawerRoutes, state }) => {
  const { orientation } = useContext(OrientationContext);
  const a11yText = consts.a11yLabel;
  return (
    <DiagonalGradient>
      <SafeAreaViewFlex>
        <View style={stylesWithProps({ orientation }).header}>
          <TouchableOpacity
            accessibilityLabel={a11yText.closeMenuIcon}
            accessibilityHint={a11yText.closeMenuHint}
            onPress={() => navigation.closeDrawer()}
            delayPressIn={0}
          >
            <Icon
              name="close"
              type="ionicon"
              color={colors.lightestText}
              containerStyle={stylesWithProps({ orientation }).icon}
            />
          </TouchableOpacity>
        </View>
        <DrawerNavigatorItems navigation={navigation} state={state} drawerRoutes={drawerRoutes} />
      </SafeAreaViewFlex>
    </DiagonalGradient>
  );
};

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ orientation }) => {
  return StyleSheet.create({
    header: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      justifyContent: 'flex-end',
      height: Platform.select({
        android: getHeaderHeight(orientation) + statusBarHeight(orientation),
        ios: undefined
      })
    },
    icon: {
      paddingHorizontal: 24,
      ...Platform.select({
        android: {
          paddingVertical: 17
        },
        ios: {
          paddingVertical: orientation === 'landscape' && !Platform.isPad ? 5 : 8
        }
      })
    }
  });
};
/* eslint-enable react-native/no-unused-styles */

CustomDrawerContentComponent.propTypes = {
  drawerRoutes: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired
};
