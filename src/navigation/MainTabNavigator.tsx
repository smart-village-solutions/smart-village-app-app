import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import { PixelRatio } from 'react-native';

import { OrientationContext } from '../OrientationProvider';
import { colors, device, normalize } from '../config';
import { TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = ({
  tabNavigatorConfig
}: {
  tabNavigatorConfig: TabNavigatorConfig;
}) => {
  const { orientation } = useContext(OrientationContext);

  const tabbarHeight =
    orientation === 'portrait' && PixelRatio.get() === 2
      ? normalize(62)
      : orientation === 'portrait' && PixelRatio.get() > 2
      ? normalize(88)
      : orientation === 'landscape' && PixelRatio.get() === 2
      ? normalize(35)
      : normalize(50);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor: tabNavigatorConfig.activeBackgroundColor,
        tabBarActiveTintColor: tabNavigatorConfig.activeTintColor,
        tabBarHideOnKeyboard: device.platform === 'android',
        tabBarInactiveBackgroundColor: tabNavigatorConfig.inactiveBackgroundColor,
        tabBarInactiveTintColor: tabNavigatorConfig.inactiveTintColor,
        tabBarItemStyle: { marginTop: normalize(0) },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray20,
          borderTopWidth: 1,
          height: tabbarHeight
        },
        tabBarLabelStyle: {
          fontSize: normalize(11),
          lineHeight: normalize(14),
          marginBottom: orientation === 'portrait' ? normalize(10) : undefined,
          marginTop: orientation === 'portrait' ? normalize(4) : undefined
        }
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
};
