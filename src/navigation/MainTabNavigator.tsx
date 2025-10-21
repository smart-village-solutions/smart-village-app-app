/* eslint-disable complexity */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext, useEffect, useState } from 'react';

import { LoadingSpinner } from '../components';
import { createDynamicTabConfig, tabNavigatorConfig } from '../config/navigation/tabConfig';
import { useStaticContent } from '../hooks';
import { OrientationContext } from '../OrientationProvider';
import { CustomTab, TabConfig, TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

export const useTabRoutes = () => {
  const { data: tabRoutesData, loading } = useStaticContent<TabNavigatorConfig>({
    name: 'tabNavigation',
    type: 'json'
  });

  const [tabRoutes, setTabRoutes] = useState<TabNavigatorConfig>();

  useEffect(() => {
    const {
      activeBackgroundColor,
      activeTintColor,
      inactiveBackgroundColor,
      inactiveTintColor,
      tabConfigs
    } = tabRoutesData || tabNavigatorConfig;

    !loading &&
      setTabRoutes((prev) => {
        const dynamicTabs = (tabConfigs as (CustomTab | TabConfig | string)[])?.map(
          (tabConfig, index) => {
            if (typeof tabConfig === 'string') {
              // here we are comparing defaultTabs with the array on main-server.
              // if the string in the main-server array matches the `initialRouteName` in the
              // `tabNavigatorConfig` (default), that tab is automatically selected.
              return tabNavigatorConfig.tabConfigs.find(
                ({ stackConfig }) => stackConfig.initialRouteName === tabConfig
              );
            } else if ('stackConfig' in tabConfig) {
              return tabConfig;
            } else {
              return createDynamicTabConfig(
                tabConfig.accessibilityLabel,
                tabConfig.iconName,
                tabConfig.iconSize,
                index,
                tabConfig.label,
                tabConfigs.length,
                tabConfig.screen,
                tabConfig.activeIconName,
                tabConfig.iconLandscapeStyle,
                tabConfig.iconStyle,
                tabConfig.params,
                tabConfig.strokeColor,
                tabConfig.strokeWidth,
                tabConfig.tabBarLabelStyle,
                tabConfig.tilesScreenParams
              );
            }
          }
        );

        return {
          ...prev,
          activeBackgroundColor,
          activeTintColor,
          inactiveBackgroundColor,
          inactiveTintColor,
          tabConfigs: dynamicTabs
        };
      });
  }, [loading, tabRoutesData]);

  return { loading, tabRoutes };
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { loading, tabRoutes } = useTabRoutes();
  const { orientation } = useContext(OrientationContext);
  const isPortrait = orientation === 'portrait';

  const [tabConfigs, setTabConfigs] = useState<TabConfig[]>();

  useEffect(() => {
    if (!loading && tabRoutes) {
      setTabConfigs(tabRoutes.tabConfigs);
    }
  }, [loading, tabRoutes]);

  if (!tabConfigs || loading) return <LoadingSpinner loading />;

  const { inactiveBackgroundColor: backgroundColor } = tabRoutes || tabNavigatorConfig;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarStyle: { backgroundColor },
        tabBarActiveBackgroundColor:
          tabRoutes?.activeBackgroundColor || tabNavigatorConfig.activeBackgroundColor,
        tabBarActiveTintColor: tabRoutes?.activeTintColor || tabNavigatorConfig.activeTintColor,
        tabBarHideOnKeyboard: true,
        tabBarInactiveBackgroundColor: backgroundColor,
        tabBarInactiveTintColor:
          tabRoutes?.inactiveTintColor || tabNavigatorConfig.inactiveTintColor,
        tabBarLabelPosition: isPortrait ? 'below-icon' : 'beside-icon'
      }}
    >
      {tabConfigs?.map((tabConfig, index) => {
        return (
          <Tab.Screen
            key={`Stack${index}`}
            name={`Stack${index}`}
            component={getStackNavigator(tabConfig.stackConfig)}
            options={tabConfig.tabOptions}
          />
        );
      })}
    </Tab.Navigator>
  );
};
