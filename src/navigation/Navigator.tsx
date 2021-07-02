import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';

import { navigatorConfig } from '../config/navigation/config';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const Navigator = () => (
  <NavigationContainer
    theme={{
      dark: DefaultTheme.dark,
      colors: { ...DefaultTheme.colors, background: '#fff' }
    }}
  >
    {navigatorConfig.type === 'drawer' ? (
      <DrawerNavigator />
    ) : (
      <MainTabNavigator tabNavigatorConfig={navigatorConfig.config} />
    )}
  </NavigationContainer>
);
