import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';

import { linkingConfig, navigatorConfig } from '../config/navigation';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const Navigator = () => (
  <NavigationContainer
    theme={{
      dark: DefaultTheme.dark,
      colors: { ...DefaultTheme.colors, background: '#fff' }
    }}
    linking={linkingConfig}
  >
    {navigatorConfig.type === 'drawer' ? (
      <DrawerNavigator />
    ) : (
      <MainTabNavigator tabNavigatorConfig={navigatorConfig.config} />
    )}
  </NavigationContainer>
);
