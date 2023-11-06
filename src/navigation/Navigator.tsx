import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'react-native';

import { colors } from '../config';
import { navigationConfig } from '../config/navigation';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const Navigator = ({ navigationType }: { navigationType: 'drawer' | 'tab' }) => {
  const { navigatorConfig, linkingConfig } = navigationConfig(navigationType);

  return (
    <NavigationContainer
      theme={{
        dark: DefaultTheme.dark,
        colors: { ...DefaultTheme.colors, background: colors.surface }
      }}
      linking={linkingConfig}
    >
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      {navigatorConfig.type === 'drawer' ? (
        <DrawerNavigator />
      ) : (
        <MainTabNavigator tabNavigatorConfig={navigatorConfig.config} />
      )}
    </NavigationContainer>
  );
};
