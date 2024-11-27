import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { colors, device, normalize } from '../config';
import { TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = ({
  tabNavigatorConfig
}: {
  tabNavigatorConfig: TabNavigatorConfig;
}) => (
  <Tab.Navigator
    screenOptions={{
      headerShown: false,
      tabBarActiveBackgroundColor: tabNavigatorConfig.activeBackgroundColor,
      tabBarActiveTintColor: tabNavigatorConfig.activeTintColor,
      tabBarHideOnKeyboard: true,
      tabBarInactiveBackgroundColor: tabNavigatorConfig.inactiveBackgroundColor,
      tabBarInactiveTintColor: tabNavigatorConfig.inactiveTintColor,
      tabBarItemStyle: { marginTop: normalize(0) },
      tabBarStyle: { backgroundColor: colors.surface }
    }}
  >
    {tabNavigatorConfig.tabConfigs.map((tabConfig, index) => (
      <Tab.Screen
        key={`Stack${index}`}
        name={`Stack${index}`}
        component={getStackNavigator(tabConfig.stackConfig)}
        options={tabConfig.tabOptions}
      />
    ))}
  </Tab.Navigator>
);
