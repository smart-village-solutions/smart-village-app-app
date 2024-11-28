/* eslint-disable complexity */
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React, { useContext } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { OrientationContext } from '../OrientationProvider';
import { colors, normalize } from '../config';
import { TabNavigatorConfig } from '../types';

import { getStackNavigator } from './AppStackNavigator';

const Tab = createBottomTabNavigator();

export const MainTabNavigator = ({
  tabNavigatorConfig
}: {
  tabNavigatorConfig: TabNavigatorConfig;
}) => {
  const { orientation } = useContext(OrientationContext);
  const safeAreaInsets = useSafeAreaInsets();
  const isPortrait = orientation === 'portrait';
  const tabBarHeight = !isPortrait
    ? normalize(35) + safeAreaInsets.bottom
    : normalize(64) + safeAreaInsets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveBackgroundColor: tabNavigatorConfig.activeBackgroundColor,
        tabBarActiveTintColor: tabNavigatorConfig.activeTintColor,
        tabBarInactiveBackgroundColor: tabNavigatorConfig.inactiveBackgroundColor,
        tabBarInactiveTintColor: tabNavigatorConfig.inactiveTintColor,
        tabBarHideOnKeyboard: true,
        tabBarItemStyle: { marginTop: normalize(0) },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.gray20,
          borderTopWidth: 1,
          height: tabBarHeight
        },
        tabBarLabelStyle: {
          fontSize: normalize(11),
          lineHeight: normalize(14),
          marginBottom: orientation === 'portrait' ? normalize(10) : undefined,
          marginTop: orientation === 'portrait' ? normalize(4) : undefined
        },
        tabBarLabelPosition: isPortrait ? 'below-icon' : 'beside-icon'
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
/* eslint-enable complexity */
