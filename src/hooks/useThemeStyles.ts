import { useMemo } from 'react';
import { ImageStyle, StyleSheet, TextStyle, ViewStyle } from 'react-native';

import { ThemeColorPalette } from '../types/Theme';

import { useTheme } from './useTheme';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export const useThemeStyles = <T extends NamedStyles<T>>(
  createStyles: (colors: ThemeColorPalette) => T
): T => {
  const { colors } = useTheme();

  return useMemo(() => StyleSheet.create(createStyles(colors)), [colors, createStyles]);
};
