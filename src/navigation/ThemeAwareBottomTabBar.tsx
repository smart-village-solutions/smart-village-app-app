import { BottomTabBar, BottomTabBarProps } from 'expo-router/js-tabs';
import React from 'react';

import { useTheme } from '../hooks/useTheme';

/**
 * Recreates only the visual tab bar when the resolved theme changes.
 *
 * On Android, the existing BottomTabBar can retain native views with the
 * previous route colors until the focused tab changes. Keying the visual bar
 * keeps the navigator and every configured tab route intact while refreshing
 * all tab bar options immediately.
 */
export const ThemeAwareBottomTabBar = (props: BottomTabBarProps) => {
  const { mode } = useTheme();

  return <BottomTabBar key={mode} {...props} />;
};

// React Navigation invokes `tabBar` as a render callback. Returning a component
// element keeps ThemeAwareBottomTabBar's hook inside React's render lifecycle.
export const renderThemeAwareBottomTabBar = (props: BottomTabBarProps) => (
  <ThemeAwareBottomTabBar {...props} />
);
