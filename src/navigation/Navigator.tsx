import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import React, { useContext } from 'react';
import { Text } from '../components';
import { consts } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { DrawerNavigator } from './DrawerNavigator';
import { TabNavigator } from './TabNavigator';

export const Navigator = () => {
  const { globalSettings } = useContext(SettingsContext);

  return (
    <NavigationContainer
      theme={{
        dark: DefaultTheme.dark,
        colors: { ...DefaultTheme.colors, background: '#fff' }
      }}
    >
      {globalSettings?.navigation === consts.DRAWER ? (
        <DrawerNavigator config={globalSettings.navigation} />
      ) : (
        <TabNavigator config={globalSettings?.navigation ?? 'undefined'} />
      )}
    </NavigationContainer>
  );
};
