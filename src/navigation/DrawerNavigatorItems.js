import PropTypes from 'prop-types';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

import { BoldText, Wrapper, WrapperHorizontal } from '../components';
import { normalize, texts } from '../config';

import { DrawerNavigatorItem } from './DrawerNavigatorItem';

const getActiveRoute = (navigationState) => {
  if (
    !navigationState.routes ||
    !navigationState.routes.length ||
    navigationState.index >= navigationState.routes.length
  ) {
    return navigationState;
  }

  const childActiveRoute = navigationState.routes[navigationState.index];
  return getActiveRoute(childActiveRoute.state ?? childActiveRoute);
};

/**
 * Component that renders the navigation list in the drawer.
 *
 * based on:
 *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/views/DrawerNavigatorItems.tsx
 */
const DrawerNavigatorItems = ({ drawerRoutes, navigation, state }) => {
  /**
   * based on:
   *   https://github.com/react-navigation/drawer/blob/c5954d744f463e7f1c67941b8eb6914c0101e56c/src/views/DrawerSidebar.tsx#L67
   *
   * but we want to navigate always inside our single app stack
   */
  const activeRoute = getActiveRoute(state);

  return (
    <ScrollView bounces={false}>
      {Object.keys(drawerRoutes).map((route, index) => {
        const itemInfo = drawerRoutes[route];

        return (
          <DrawerNavigatorItem
            activeRoute={activeRoute}
            itemInfo={itemInfo}
            navigation={navigation}
            topDivider={index === 0}
            key={itemInfo.params.title}
          />
        );
      })}
      <Wrapper />
      <WrapperHorizontal style={styles.sectionTitleContainer}>
        <BoldText lightest small>
          {texts.screenTitles.settings}
        </BoldText>
      </WrapperHorizontal>
      <DrawerNavigatorItem
        activeRoute={activeRoute}
        itemInfo={{
          label: texts.screenTitles.appSettings,
          params: { rootRouteName: 'Settings', title: texts.screenTitles.settings },
          screen: 'Settings'
        }}
        navigation={navigation}
        topDivider
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  sectionTitleContainer: {
    paddingBottom: normalize(8)
  }
});

DrawerNavigatorItems.displayName = 'DrawerNavigatorItems';

DrawerNavigatorItems.propTypes = {
  drawerRoutes: PropTypes.object.isRequired,
  navigation: PropTypes.object.isRequired,
  state: PropTypes.object.isRequired
};

export default DrawerNavigatorItems;
