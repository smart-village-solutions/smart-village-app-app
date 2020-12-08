import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { colors, device } from '../config';
import { DiagonalGradient } from '../components';
import DrawerNavigatorItems from './DrawerNavigatorItems';
import { OrientationContext } from '../OrientationProvider';

/**
 * based on the default content component from React Navigation:
 *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/navigators/createDrawerNavigator.tsx
 */
export const CustomDrawerContentComponent = (props) => {
  const { orientation } = useContext(OrientationContext);

  return (
    <DiagonalGradient>
      <View style={styles.headerContainer}>
        <View style={stylesWithProps({ orientation }).header}>
          <TouchableOpacity
            accessibilityLabel="Schließen Taste"
            accessibilityHint="Menü schließen"
            onPress={() => props.navigation.closeDrawer()}
            delayPressIn={0}
          >
            <Icon
              name="ios-close"
              type="ionicon"
              color={colors.lightestText}
              containerStyle={stylesWithProps({ orientation }).icon}
            />
          </TouchableOpacity>
        </View>
      </View>
      <DrawerNavigatorItems {...props} />
    </DiagonalGradient>
  );
};

const styles = StyleSheet.create({
  headerContainer: Platform.select({
    android: {
      backgroundColor: colors.darkText,
      elevation: 2
    },
    ios: {
      shadowColor: colors.darkText,
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 3
    }
  })
});

export const getHeaderHeight = (orientation) =>
  // Android always 56
  // iOS:
  //   portrait: 44
  //   landscape: tablet 66 / phone 32
  Platform.select({
    android: 56,
    ios: orientation === 'landscape' ? (!Platform.isPad ? 32 : 66) : 44
  });

export const statusBarHeight = (orientation) =>
  device.platform === 'android'
    ? getStatusBarHeight()
    : orientation === 'portrait'
    ? getStatusBarHeight()
    : 0;

/* eslint-disable react-native/no-unused-styles */
/* this works properly, we do not want that warning */
const stylesWithProps = ({ orientation }) => {
  const height = getHeaderHeight(orientation) + statusBarHeight(orientation);

  return StyleSheet.create({
    header: {
      alignItems: 'flex-end',
      flexDirection: 'row',
      backgroundColor: colors.primary,
      height,
      justifyContent: 'flex-end'
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
  navigation: PropTypes.object.isRequired
};
