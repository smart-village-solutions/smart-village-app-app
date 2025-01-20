/* eslint-disable complexity */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext, useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoadingSpinner } from '../components';
import { colors, normalize } from '../config';
import { createDynamicTabConfig, tabNavigatorConfig } from '../config/navigation/tabConfig';
import { useStaticContent } from '../hooks';
import { OrientationContext } from '../OrientationProvider';
import { TabConfig, TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

const useTabRoutes = () => {
  const {
    data: tabRoutesData,
    error,
    loading
  } = useStaticContent<TabNavigatorConfig>({
    name: 'tabNavigation',
    type: 'json'
  });

  const [tabRoutes, setTabRoutes] = useState<TabNavigatorConfig>(tabNavigatorConfig);

  useEffect(() => {
    const {
      activeBackgroundColor,
      activeTintColor,
      inactiveBackgroundColor,
      inactiveTintColor,
      tabConfigs
    } = tabRoutesData || tabNavigatorConfig;

    setTabRoutes((prev) => {
      const dynamicTabs = tabConfigs?.map((tab, index) => {
        if (typeof tab === 'string') {
          // here we are comparing defaultTabs with the array on main-server.
          // if the string in the main-server array matches the `initialRouteName` in the
          // `tabNavigatorConfig` (default), that tab is automatically selected.
          return tabNavigatorConfig.tabConfigs.find(
            (tabConfig) => tabConfig.stackConfig.initialRouteName === tab
          );
        } else if ('stackConfig' in tab) {
          return tab;
        } else {
          return createDynamicTabConfig(
            tab.accessibilityLabel,
            tab.iconName,
            tab.iconSize,
            index,
            tab.label,
            tabConfigs.length,
            tab.screen,
            tab.params,
            tab.iconLandscapeStyle,
            tab.iconStyle
          );
        }
      });

      return {
        ...prev,
        activeBackgroundColor,
        activeTintColor,
        inactiveBackgroundColor,
        inactiveTintColor,
        tabConfigs: dynamicTabs
      };
    });
  }, [tabRoutesData, error]);

  return { loading, tabRoutes };
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { loading, tabRoutes } = useTabRoutes();
  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const isPortrait = orientation === 'portrait';
  const tabBarHeight = !isPortrait
    ? normalize(35) + safeAreaInsets.bottom
    : normalize(64) + safeAreaInsets.bottom;

  const [tabConfigs, setTabConfigs] = useState<TabConfig[]>(tabNavigatorConfig.tabConfigs);

  useEffect(() => {
    if (!loading) {
      setTabConfigs(tabRoutes.tabConfigs);
    }
  }, [tabRoutes, loading]);

  if (loading) return <LoadingSpinner loading />;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor:
          tabRoutes?.activeBackgroundColor || tabNavigatorConfig.activeBackgroundColor,
        tabBarActiveTintColor: tabRoutes?.activeTintColor || tabNavigatorConfig.activeTintColor,
        tabBarHideOnKeyboard: true,
        tabBarInactiveBackgroundColor:
          tabRoutes?.inactiveBackgroundColor || tabNavigatorConfig.inactiveBackgroundColor,
        tabBarInactiveTintColor:
          tabRoutes?.inactiveTintColor || tabNavigatorConfig.inactiveTintColor,
        tabBarItemStyle: { marginTop: normalize(0) },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray20,
          borderTopWidth: 1,
          height: tabBarHeight
        },
        tabBarLabelStyle: {
          fontSize: normalize(12),
          lineHeight: normalize(14),
          marginBottom: orientation === 'portrait' ? normalize(10) : undefined,
          marginTop: orientation === 'portrait' ? normalize(4) : undefined
        },
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
