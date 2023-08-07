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
      tabBarActiveTintColor: tabNavigatorConfig.activeTintColor,
      tabBarInactiveTintColor: tabNavigatorConfig.inactiveTintColor,
      tabBarActiveBackgroundColor: tabNavigatorConfig.activeBackgroundColor,
      tabBarInactiveBackgroundColor: tabNavigatorConfig.inactiveBackgroundColor,
      tabBarStyle: { backgroundColor: colors.surface, marginTop: normalize(0) },
      tabBarHideOnKeyboard: device.platform === 'android',
      headerShown: false
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
