import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useContext } from 'react';
import { StatusBar } from 'react-native';

import { linkingConfig, navigatorConfig } from '../config/navigation';
import { AppIntroScreen } from '../screens';
import { SettingsContext } from '../SettingsProvider';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';

export const Navigator = () => {
  const {
    onboardingSettings: { onboardingComplete }
  } = useContext(SettingsContext);

  if (!onboardingComplete) {
    return (
      <>
        <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
        <AppIntroScreen />
      </>
    );
  }

  return (
    <NavigationContainer
      theme={{
        dark: DefaultTheme.dark,
        colors: { ...DefaultTheme.colors, background: '#fff' }
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
};
