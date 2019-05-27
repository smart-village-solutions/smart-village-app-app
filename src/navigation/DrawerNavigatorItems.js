import PropTypes from 'prop-types';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  TouchableOpacity,
  View
} from 'react-native';
import { NavigationActions, StackActions } from 'react-navigation';
import { Divider } from 'react-native-elements';

import { colors, device } from '../config';

/**
 * Component that renders the navigation list in the drawer.
 *
 * based on:
 *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/views/DrawerNavigatorItems.tsx
 */
const DrawerNavigatorItems = ({
  items,
  activeItemKey,
  activeTintColor,
  activeBackgroundColor,
  inactiveTintColor,
  inactiveBackgroundColor,
  getLabel,
  itemsContainerStyle,
  itemStyle,
  labelStyle,
  activeLabelStyle,
  inactiveLabelStyle,
  drawerPosition,
  navigation
}) => {
  const Touchable = device.platform === 'ios' ? TouchableOpacity : TouchableNativeFeedback;

  /**
   * based on:
   *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/views/DrawerSidebar.tsx#L67
   *
   * but we want to navigate always to the root of each stack and do not remember the earlier
   * navigations inside a stack
   */
  const handleItemPress = ({ route, focused }) => {
    if (focused) {
      navigation.closeDrawer();
    } else {
      navigation.navigate({
        routeName: route.routeName, // navigate to the stack
        action: StackActions.reset({
          index: 0,
          actions: [
            NavigationActions.navigate({
              routeName: 'Index', // navigate to the Index route inside the stack
              params: { ...route.params }
            })
          ]
        })
      });
    }
  };

  return (
    <View style={[styles.container, itemsContainerStyle]}>
      {items.map((route, index) => {
        const focused = activeItemKey === route.key;
        const color = focused ? activeTintColor : inactiveTintColor;
        const fontWeight = focused ? 'bold' : 'normal';
        const backgroundColor = focused ? activeBackgroundColor : inactiveBackgroundColor;
        const scene = { route, index, focused, tintColor: color };
        const label = getLabel(scene);
        const accessibilityLabel = typeof label === 'string' ? label : undefined;
        const extraLabelStyle = focused ? activeLabelStyle : inactiveLabelStyle;

        return (
          <View key={route.key}>
            <Touchable
              accessible
              accessibilityLabel={accessibilityLabel}
              onPress={() => handleItemPress({ route, focused })}
              delayPressIn={0}
            >
              <SafeAreaView
                style={[{ backgroundColor }, styles.item, itemStyle]}
                forceInset={{
                  [drawerPosition]: 'always',
                  [drawerPosition === 'left' ? 'right' : 'left']: 'never',
                  vertical: 'never'
                }}
              >
                {typeof label === 'string' ? (
                  <Text
                    style={[styles.label, { color }, { fontWeight }, labelStyle, extraLabelStyle]}
                  >
                    {label}
                  </Text>
                ) : (
                  label
                )}
              </SafeAreaView>
            </Touchable>
            <Divider style={styles.divider} />
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  label: {
    fontSize: 16,
    paddingHorizontal: 15,
    paddingVertical: 20
  },
  divider: {
    backgroundColor: colors.lightestText,
    height: StyleSheet.hairlineWidth,
    opacity: 0.4
  }
});

DrawerNavigatorItems.propTypes = {
  items: PropTypes.array.isRequired,
  activeItemKey: PropTypes.string,
  activeTintColor: PropTypes.string,
  activeBackgroundColor: PropTypes.string,
  inactiveTintColor: PropTypes.string,
  inactiveBackgroundColor: PropTypes.string,
  getLabel: PropTypes.func.isRequired,
  itemsContainerStyle: PropTypes.object,
  itemStyle: PropTypes.object,
  labelStyle: PropTypes.object,
  activeLabelStyle: PropTypes.object,
  inactiveLabelStyle: PropTypes.object,
  drawerPosition: PropTypes.string.isRequired,
  navigation: PropTypes.object.isRequired
};

DrawerNavigatorItems.defaultProps = {
  activeTintColor: colors.lightestText,
  activeBackgroundColor: 'transparent',
  inactiveTintColor: colors.lightestText,
  inactiveBackgroundColor: 'transparent'
};

export default DrawerNavigatorItems;
