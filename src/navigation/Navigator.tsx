import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { colors } from '../config';
import { navigationConfig } from '../config/navigation';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { navigationRef } from './navigationRef';

export const Navigator = ({ navigationType }: { navigationType: 'drawer' | 'tab' }) => {
  const { linkingConfig } = navigationConfig(navigationType);

  return (
    <NavigationContainer
      ref={navigationRef}
      theme={{
        dark: DefaultTheme.dark,
        colors: { ...DefaultTheme.colors, background: colors.surface },
        fonts: DefaultTheme.fonts
      }}
      linking={linkingConfig}
    >
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      {navigationType === 'drawer' ? <DrawerNavigator /> : <MainTabNavigator />}
    </NavigationContainer>
  );
};
