import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';

import { colors } from '../config';
import { linkingConfig, navigatorConfig } from '../config/navigation';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const Navigator = () => (
  <NavigationContainer
    theme={{
      dark: DefaultTheme.dark,
      colors: { ...DefaultTheme.colors, background: colors.surface }
    }}
    linking={linkingConfig}
  >
    <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
    {navigatorConfig.type === 'drawer' ? (
      <DrawerNavigator />
    ) : (
      <MainTabNavigator tabNavigatorConfig={navigatorConfig.config} />
    )}
  </NavigationContainer>
);
