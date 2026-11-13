import type { StackHeaderProps } from 'expo-router/build/react-navigation/stack';
import React from 'react';
import { StyleSheet } from 'react-native';

import type { ThemeColorPalette } from '../types/Theme';
import { resolveHeaderForeground, resolveHeaderStatusBarStyle } from '../helpers/headerAppearance';
import { HeaderForegroundContext } from '../hooks/useHeaderForeground';
import { useTheme } from '../hooks/useTheme';
import { MeasuredHeader } from '../navigation/MeasuredHeader';

import { AppStatusBar } from './AppStatusBar';
import type { AppStatusBarProps } from './AppStatusBar';
import { DiagonalGradient } from './DiagonalGradient';

type ThemeValue<T> = T | ((colors: ThemeColorPalette) => T);

export type HeaderAppearanceConfig = {
  headerBackgroundColor?: ThemeValue<string>;
  headerStatusBarStyle?: ThemeValue<AppStatusBarProps['barStyle']>;
};

const resolveThemeValue = <T,>(value: ThemeValue<T> | undefined, colors: ThemeColorPalette) =>
  typeof value === 'function' ? (value as (palette: ThemeColorPalette) => T)(colors) : value;

export const NavigationHeader = ({
  headerBackgroundColor,
  headerStatusBarStyle,
  ...props
}: StackHeaderProps & HeaderAppearanceConfig) => {
  const { colors } = useTheme();
  const headerStyle = StyleSheet.flatten(props.options.headerStyle);
  const styledBackground =
    headerStyle && typeof headerStyle === 'object' && 'backgroundColor' in headerStyle
      ? headerStyle.backgroundColor
      : undefined;
  const background =
    resolveThemeValue(headerBackgroundColor, colors) ??
    (typeof styledBackground === 'string' ? styledBackground : colors.surface);
  const tintColor = props.options.headerTintColor;
  const foreground = resolveHeaderForeground(
    colors,
    background,
    typeof tintColor === 'string' ? tintColor : undefined
  );
  const barStyle =
    resolveThemeValue(headerStatusBarStyle, colors) ?? resolveHeaderStatusBarStyle(foreground);

  return (
    <HeaderForegroundContext.Provider value={foreground}>
      <MeasuredHeader
        {...props}
        options={{
          ...props.options,
          headerTintColor: foreground,
          // A legacy title style must not give the title a different color from its controls.
          headerTitleStyle: [props.options.headerTitleStyle, { color: foreground }],
          headerBackTitleStyle: [props.options.headerBackTitleStyle, { color: foreground }],
          headerBackground:
            props.options.headerBackground ??
            (() => (
              <DiagonalGradient colors={[background, background]}>
                <AppStatusBar backgroundColor={background} barStyle={barStyle} />
              </DiagonalGradient>
            ))
        }}
      />
    </HeaderForegroundContext.Provider>
  );
};
