import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useEffect, useState } from 'react';

import { LoadingSpinner } from '../components';
import { colors, normalize } from '../config';
import {
  createDynamicTabConfig,
  tabNavigatorConfig as defaultTabNavigatorConfig
} from '../config/navigation/tabConfig';
import { useStaticContent } from '../hooks';
import { ScreenName, TabConfig, TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

const defaultTabRoutes: TabRoutes = {
  tabConfig: {
    activeBackgroundColor: colors.surface,
    activeTintColor: colors.accent,
    inactiveBackgroundColor: colors.surface,
    inactiveTintColor: colors.primary,
    tabs: ['Home', 'Service', 'Events', 'Index', 'About']
  }
};

type Tab = {
  accessibilityLabel: string;
  iconName: string;
  iconSize: number;
  label: string;
  screen: ScreenName;
  params?: Record<string, any>;
};

type TabRoutes = {
  tabConfig: {
    activeTintColor: string;
    inactiveTintColor: string;
    activeBackgroundColor: string;
    inactiveBackgroundColor: string;
    tabs: (Tab | string)[];
  };
};

const useTabRoutes = () => {
  const { data, error, loading } = useStaticContent<TabRoutes>({
    name: 'tabNavigation',
    type: 'json'
  });

  const [tabRoutes, setTabRoutes] = useState<TabRoutes>(defaultTabRoutes);

  useEffect(() => {
    const tabs: (Tab | string)[] = data?.tabConfig.tabs || defaultTabRoutes.tabConfig.tabs;
    const { activeBackgroundColor, activeTintColor, inactiveBackgroundColor, inactiveTintColor } =
      data?.tabConfig || defaultTabRoutes.tabConfig;

    setTabRoutes((prev) => {
      const filteredTabs = defaultTabNavigatorConfig.tabConfigs.filter((tabConfig) => {
        const screen = tabConfig.stackConfig.initialRouteName;

        return tabs.some((tab) =>
          typeof tab === 'string' ? tab === screen : tab.screen === screen
        );
      });

      const dynamicTabs = tabs
        .map((tab, index) => {
          if (typeof tab === 'string') {
            const screen = tab;
            return filteredTabs.find(
              (tabConfig) => tabConfig.stackConfig.initialRouteName === screen
            );
          } else {
            return createDynamicTabConfig(
              tab.accessibilityLabel,
              tab.iconName,
              tab.iconSize,
              index,
              tab.label,
              tabs.length,
              tab.screen,
              tab.params
            );
          }
        })
        .filter(Boolean) as TabConfig[];

      return {
        ...prev,
        tabConfig: {
          ...prev.tabConfig,
          activeBackgroundColor,
          activeTintColor,
          inactiveBackgroundColor,
          inactiveTintColor,
          tabs: dynamicTabs
        }
      };
    });
  }, [data, error]);

  return { loading, tabRoutes };
};

const Tab = createBottomTabNavigator();

export const MainTabNavigator = ({
  tabNavigatorConfig = defaultTabNavigatorConfig
}: {
  tabNavigatorConfig?: TabNavigatorConfig;
}) => {
  const { loading, tabRoutes } = useTabRoutes();

  const [tabConfigs, setTabConfigs] = useState<TabConfig[]>(defaultTabNavigatorConfig.tabConfigs);

  useEffect(() => {
    if (!loading) {
      setTabConfigs(tabRoutes.tabConfig.tabs);
    }
  }, [tabRoutes, loading]);

  if (loading) return <LoadingSpinner loading />;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor:
          tabRoutes.tabConfig?.activeBackgroundColor || tabNavigatorConfig.activeBackgroundColor,
        tabBarActiveTintColor:
          tabRoutes.tabConfig?.activeTintColor || tabNavigatorConfig.activeTintColor,
        tabBarHideOnKeyboard: true,
        tabBarInactiveBackgroundColor:
          tabRoutes.tabConfig?.inactiveBackgroundColor ||
          tabNavigatorConfig.inactiveBackgroundColor,
        tabBarInactiveTintColor:
          tabRoutes.tabConfig?.inactiveTintColor || tabNavigatorConfig.inactiveTintColor,
        tabBarItemStyle: { marginTop: normalize(0) },
        tabBarStyle: { backgroundColor: colors.surface }
      }}
    >
      {tabConfigs.map((tabConfig, index) => {
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
