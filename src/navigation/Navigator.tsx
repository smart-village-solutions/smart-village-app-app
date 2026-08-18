import { DarkTheme, DefaultTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { FloatingButton } from '../components/FloatingButton';
import { navigationConfig } from '../config/navigation';
import { useTheme } from '../hooks/useTheme';
import { ReadAloudAvailabilityProvider } from '../ReadAloudAvailabilityProvider';

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
  const { colors, isDark } = useTheme();
  const navigationTheme = useMemo(() => {
    const baseTheme = isDark ? DarkTheme : DefaultTheme;

    return {
      ...baseTheme,
      colors: {
        ...baseTheme.colors,
        background: colors.background,
        border: colors.border,
        card: colors.surface,
        notification: colors.error,
        primary: colors.primary,
        text: colors.text
      }
    };
  }, [colors, isDark]);
  const rootStyle = useMemo(
    () => [styles.flex, { backgroundColor: colors.background }],
    [colors.background]
  );

  // Account for the tab bar height so FloatingButton doesn't overlap it.
  // Drawer navigation has no tab bar, so no offset is needed there.
  const tabBottomOffset = navigationType === 'tab' ? TAB_BAR_HEIGHT + safeAreaBottom : 0;

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme} linking={linkingConfig}>
      <ReadAloudAvailabilityProvider>
        <View style={rootStyle}>
          <StatusBar style={isDark ? 'light' : 'dark'} translucent backgroundColor="transparent" />
          {navigationType === NavigationType.DRAWER ? <DrawerNavigator /> : <MainTabNavigator />}
          <FloatingButton publicJsonFile="floatingButton" bottomOffset={tabBottomOffset} />
        </View>
      </ReadAloudAvailabilityProvider>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1
  }
});
