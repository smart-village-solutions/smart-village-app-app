import React, { useContext, useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';

import { AccessibilityContext } from './AccessibilityProvider';
import { AppThemeContextValue, ThemeContext } from './ThemeContext';

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
