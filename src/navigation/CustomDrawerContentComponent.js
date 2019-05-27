import PropTypes from 'prop-types';
import React from 'react';
import { Platform, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements';
import { getStatusBarHeight } from 'react-native-status-bar-height';

import { colors } from '../config';
import { DiagonalGradient } from '../components';
import DrawerNavigatorItems from './DrawerNavigatorItems';

/**
 * based on the default content component from React Navigation:
 *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/navigators/createDrawerNavigator.tsx
 */
export const CustomDrawerContentComponent = (props) => {
  const { navigation } = props;

  return (
    <DiagonalGradient>
      <ScrollView alwaysBounceVertical={false} style={styles.fullHeight}>
        <View style={styles.headerContainer}>
          <DiagonalGradient>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigation.closeDrawer()} delayPressIn={0}>
                <Icon
                  name="ios-close"
                  type="ionicon"
                  color={colors.lightestText}
                  containerStyle={styles.icon}
                />
              </TouchableOpacity>
            </View>
          </DiagonalGradient>
        </View>
        <DrawerNavigatorItems {...props} />
      </ScrollView>
    </DiagonalGradient>
  );
};

const styles = StyleSheet.create({
  fullHeight: {
    height: '100%'
  },
  headerContainer: Platform.select({
    android: {
      elevation: 4
    },
    ios: {
      shadowColor: colors.darkText,
      shadowOffset: { height: 1, width: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 3
    }
  }),
  header: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    height:
      Platform.select({
        android: 56,
        default: 44
      }) + getStatusBarHeight(),
    justifyContent: 'flex-end',
    paddingLeft: 10,
    paddingTop: getStatusBarHeight()
  },
  icon: {
    paddingHorizontal: 10
  }
});

CustomDrawerContentComponent.propTypes = {
  navigation: PropTypes.object.isRequired
};
