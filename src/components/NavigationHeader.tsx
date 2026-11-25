import type { StackHeaderProps } from 'expo-router/build/react-navigation/stack';
import React, { createContext, useContext, useMemo } from 'react';
import { StyleSheet } from 'react-native';

import type { ThemeColorPalette } from '../types/Theme';
import {
  resolveHeaderBackgroundColors,
  resolveHeaderForeground
} from '../helpers/headerAppearance';
import { useHeaderAppearance } from '../hooks/useHeaderAppearance';
import { HeaderForegroundContext } from '../hooks/useHeaderForeground';
import { useTheme } from '../hooks/useTheme';
import { MeasuredHeader } from '../navigation/MeasuredHeader';

import { AppStatusBar } from './AppStatusBar';
import type { AppStatusBarProps } from './AppStatusBar';
import { DiagonalGradient } from './DiagonalGradient';

const BackgroundColorsContext = createContext<readonly string[]>([]);
const HeaderBackground = () => {
  const colors = useContext(BackgroundColorsContext);
  return <DiagonalGradient colors={colors} />;
};
const renderHeaderBackground = () => <HeaderBackground />;

type ThemeValue<T> = T | ((colors: ThemeColorPalette) => T);

export type HeaderAppearanceConfig = {
  headerBackgroundColor?: ThemeValue<string>;
  headerGradientColors?: ThemeValue<readonly [string, string, ...string[]]>;
  headerStatusBarStyle?: ThemeValue<AppStatusBarProps['barStyle']>;
};

const resolveThemeValue = <T,>(value: ThemeValue<T> | undefined, colors: ThemeColorPalette) =>
  typeof value === 'function' ? (value as (palette: ThemeColorPalette) => T)(colors) : value;

export const NavigationHeader = ({
  headerBackgroundColor,
  headerGradientColors,
  headerStatusBarStyle,
  ...props
}: StackHeaderProps & HeaderAppearanceConfig) => {
  const { colors } = useTheme();
  const configured = useHeaderAppearance();
  const headerStyle = StyleSheet.flatten(props.options.headerStyle);
  const styledBackground =
    headerStyle && typeof headerStyle === 'object' && 'backgroundColor' in headerStyle
      ? headerStyle.backgroundColor
      : undefined;
  const backgroundColors = useMemo(
    () =>
      resolveHeaderBackgroundColors(
        colors.surface,
        configured,
        resolveThemeValue(headerBackgroundColor, colors) ??
          (typeof styledBackground === 'string' ? styledBackground : undefined),
        resolveThemeValue(headerGradientColors, colors)
      ),
    [colors, configured, headerBackgroundColor, styledBackground, headerGradientColors]
  );
  const background = backgroundColors[0];
  const tintColor = props.options.headerTintColor ?? configured.tintColor;
  const foreground = resolveHeaderForeground(
    colors,
    backgroundColors,
    typeof tintColor === 'string' ? tintColor : undefined
  );
  const barStyle = resolveThemeValue(headerStatusBarStyle, colors);

  return (
    <HeaderForegroundContext.Provider value={foreground}>
      <AppStatusBar backgroundColor={background} barStyle={barStyle} />
      <BackgroundColorsContext.Provider value={backgroundColors}>
        <MeasuredHeader
          {...props}
          options={{
            ...props.options,
            headerTintColor: foreground,
            // A legacy title style must not give the title a different color from its controls.
            headerTitleStyle: [props.options.headerTitleStyle, { color: foreground }],
            headerBackTitleStyle: [props.options.headerBackTitleStyle, { color: foreground }],
            headerBackground: props.options.headerBackground ?? renderHeaderBackground
          }}
        />
      </BackgroundColorsContext.Provider>
    </HeaderForegroundContext.Provider>
  );
};
