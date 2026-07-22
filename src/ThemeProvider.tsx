import React, { createContext, useContext, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { AccessibilityContext } from './AccessibilityProvider';
import { lightColors } from './config/colors';
import { ResolvedThemeMode, ThemeColorPalette } from './types/Theme';

export type AppThemeContextValue = {
  colors: ThemeColorPalette;
  isDark: boolean;
  mode: ResolvedThemeMode;
};

const defaultTheme: AppThemeContextValue = {
  colors: lightColors,
  isDark: false,
  mode: 'light'
};

export const ThemeContext = createContext<AppThemeContextValue>(defaultTheme);

export const AppThemeProvider = ({ children }: { children?: React.ReactNode }) => {
  const { resolvedThemeMode, themeColors } = useContext(AccessibilityContext);
  const theme = useMemo<AppThemeContextValue>(
    () => ({
      colors: themeColors,
      isDark: resolvedThemeMode === 'dark',
      mode: resolvedThemeMode
    }),
    [resolvedThemeMode, themeColors]
  );

  return (
    <ThemeContext.Provider value={theme}>
      <StyledThemeProvider theme={theme.colors}>{children}</StyledThemeProvider>
    </ThemeContext.Provider>
  );
};
