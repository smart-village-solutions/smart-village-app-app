import { DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingButton } from '../components/FloatingButton';
import { colors } from '../config';
import { navigationConfig } from '../config/navigation';

import { DrawerNavigator } from './DrawerNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { navigationRef } from './navigationRef';

// Default bottom tab bar heights from React Navigation bottom-tabs.
const TAB_BAR_HEIGHT = Platform.OS === 'ios' ? 49 : 56;

export enum NavigationType {
  DRAWER = 'drawer',
  TAB = 'tab'
}

export const Navigator = ({ navigationType }: { navigationType: NavigationType }) => {
  const { linkingConfig } = navigationConfig(navigationType);
  const { bottom: safeAreaBottom } = useSafeAreaInsets();

  // Account for the tab bar height so FloatingButton doesn't overlap it.
  // Drawer navigation has no tab bar, so no offset is needed there.
  const tabBottomOffset = navigationType === 'tab' ? TAB_BAR_HEIGHT + safeAreaBottom : 0;

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
      <View style={styles.flex}>
        <StatusBar style="dark" translucent backgroundColor="transparent" />
        {navigationType === NavigationType.DRAWER ? <DrawerNavigator /> : <MainTabNavigator />}
        <FloatingButton publicJsonFile="floatingButton" bottomOffset={tabBottomOffset} />
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
