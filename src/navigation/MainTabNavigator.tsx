import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { device, normalize } from '../config';
import { TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = ({
  tabNavigatorConfig
}: {
  tabNavigatorConfig: TabNavigatorConfig;
}) => (
  <Tab.Navigator
    tabBarOptions={{
      activeTintColor: tabNavigatorConfig.activeTintColor,
      inactiveTintColor: tabNavigatorConfig.inactiveTintColor,
      tabStyle: { marginTop: normalize(0) },
      keyboardHidesTabBar: device.platform === 'android'
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
