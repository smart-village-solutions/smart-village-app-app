import PropTypes from 'prop-types';
import React, { memo } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';
import { Divider } from 'react-native-elements';

import { Text, Touchable } from '../components';
import { colors, normalize } from '../config';

// thx to https://stackoverflow.com/questions/53040094/how-to-get-current-route-name-in-react-navigation
const getActiveRoute = (navigationState) => {
  if (
    !navigationState.routes ||
    !navigationState.routes.length ||
    navigationState.index >= navigationState.routes.length
  ) {
    return navigationState;
  }

  const childActiveRoute = navigationState.routes[navigationState.index];
  return getActiveRoute(childActiveRoute);
};

/**
 * Component that renders the navigation list in the drawer.
 *
 * based on:
 *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/views/DrawerNavigatorItems.tsx
 */
const DrawerNavigatorItems = memo(
  ({
    items,
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
    /**
     * based on:
     *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/views/DrawerSidebar.tsx#L67
     *
     * but we want to navigate always inside our single app stack
     */
    const handleItemPress = ({ route }) => {
      navigation.navigate({
        routeName: route.params.screen,
        params: route.params
      });
      navigation.closeDrawer();
    };

    return (
      <ScrollView bounces={false} style={itemsContainerStyle}>
        {items.map((route, index) => {
          const activeRoute = getActiveRoute(navigation.state);
          const focused =
            (activeRoute && activeRoute.params ? activeRoute.params.rootRouteName : 'AppStack') ===
            route.params.rootRouteName;
          const color = focused ? activeTintColor : inactiveTintColor;
          const fontFamily = focused ? 'titillium-web-bold' : 'titillium-web-regular';
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
                onPress={() => handleItemPress({ route })}
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
                      style={[styles.label, { color }, { fontFamily }, labelStyle, extraLabelStyle]}
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
      </ScrollView>
    );
  }
);

const styles = StyleSheet.create({
  item: {
    alignItems: 'center',
    flexDirection: 'row'
  },
  label: {
    fontFamily: 'titillium-web-regular',
    fontSize: normalize(16),
    lineHeight: normalize(22),
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(12)
  },
  divider: {
    backgroundColor: colors.lightestText,
    height: StyleSheet.hairlineWidth,
    opacity: 0.3
  }
});

DrawerNavigatorItems.displayName = 'DrawerNavigatorItems';

DrawerNavigatorItems.propTypes = {
  items: PropTypes.array.isRequired,
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
