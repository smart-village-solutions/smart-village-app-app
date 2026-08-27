/* eslint-disable complexity */
import { createBottomTabNavigator } from 'expo-router/js-tabs';
import React, { useContext, useMemo } from 'react';

import { LoadingSpinner } from '../components';
import { consts } from '../config';
import {
  createDefaultTabNavigatorConfig,
  createDynamicTabConfig
} from '../config/navigation/tabConfig';
import { resolveTabBarColors } from '../helpers/tabNavigationHelper';
import { useStaticContent, useTheme } from '../hooks';
import { OrientationContext } from '../OrientationProvider';
import { CustomTab, TabConfig, TabNavigationStaticContent } from '../types';

import { getStackNavigator } from './AppStackNavigator';
import { renderThemeAwareBottomTabBar } from './ThemeAwareBottomTabBar';

const { REFRESH_INTERVALS } = consts;

const isTabConfig = (
  tabConfig: CustomTab | TabConfig | string | undefined
): tabConfig is TabConfig =>
  !!tabConfig && typeof tabConfig !== 'string' && 'stackConfig' in tabConfig;

export const useTabRoutes = () => {
  const { colors, mode } = useTheme();
  const defaultTabRoutes = useMemo(() => createDefaultTabNavigatorConfig(colors), [colors]);
  const { data: tabRoutesData, loading } = useStaticContent<TabNavigationStaticContent>({
    name: 'tabNavigation',
    refreshInterval: REFRESH_INTERVALS.ONCE_PER_MINUTE,
    type: 'json'
  });

  const tabRoutes = useMemo(() => {
    if (loading) return;

    const { tabConfigs } = tabRoutesData || defaultTabRoutes;
    const tabBarColors = resolveTabBarColors(defaultTabRoutes, tabRoutesData, mode);
    const defaultIconFillOnFocus = tabRoutesData?.tabBarIconFillOnFocus ?? false;
    const configuredDefaultTabRoutes = createDefaultTabNavigatorConfig(
      colors,
      defaultIconFillOnFocus
    );

    const dynamicTabs = (tabConfigs as (CustomTab | TabConfig | string)[])?.map(
      (tabConfig, index) => {
        if (typeof tabConfig === 'string') {
          // Here we compare default tabs with the array on main-server. A matching
          // initial route automatically selects the themed default tab definition.
          return configuredDefaultTabRoutes.tabConfigs.find(
            (defaultTab): defaultTab is TabConfig =>
              typeof defaultTab !== 'string' &&
              'stackConfig' in defaultTab &&
              defaultTab.stackConfig.initialRouteName === tabConfig
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
            tabConfig.iconSet,
            tabConfig.iconStyle,
            tabConfig.params,
            tabConfig.isHighlightedTab,
            tabConfig.strokeColor,
            tabConfig.strokeWidth,
            tabConfig.tabBarLabelStyle,
            tabConfig.tilesScreenParams,
            tabConfig.tabBarIconFillOnFocus ?? defaultIconFillOnFocus,
            colors
          );
        }
      }
    );

    return {
      ...tabBarColors,
      tabConfigs: dynamicTabs.filter(isTabConfig)
    };
  }, [colors, defaultTabRoutes, loading, mode, tabRoutesData]);

  return { defaultTabRoutes, loading, tabRoutes };
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = () => {
  const { defaultTabRoutes, loading, tabRoutes } = useTabRoutes();
  const { orientation } = useContext(OrientationContext);
  const isPortrait = orientation === 'portrait';

  const tabConfigs = tabRoutes?.tabConfigs;

  if (!tabConfigs || loading) return <LoadingSpinner loading />;

  const { inactiveBackgroundColor: backgroundColor } = tabRoutes || defaultTabRoutes;

  return (
    <Tab.Navigator
      tabBar={renderThemeAwareBottomTabBar}
      screenOptions={{
        headerShown: false,
        tabBarAllowFontScaling: false,
        tabBarStyle: { backgroundColor },
        tabBarActiveBackgroundColor:
          tabRoutes?.activeBackgroundColor || defaultTabRoutes.activeBackgroundColor,
        tabBarActiveTintColor: tabRoutes?.activeTintColor || defaultTabRoutes.activeTintColor,
        tabBarHideOnKeyboard: true,
        tabBarInactiveBackgroundColor: backgroundColor,
        tabBarInactiveTintColor: tabRoutes?.inactiveTintColor || defaultTabRoutes.inactiveTintColor,
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
