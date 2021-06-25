import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';

import { device, normalize } from '../config';
import { TabConfig, TabNavigatorConfig } from '../types';

import { AppStackNavigator } from './AppStackNavigator';

const component = (tabConfig: TabConfig) => {
  return () => AppStackNavigator(tabConfig.stackConfig);
};

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
        component={component(tabConfig)}
        options={tabConfig.tabOptions}
      />
    ))}
  </Tab.Navigator>
);
