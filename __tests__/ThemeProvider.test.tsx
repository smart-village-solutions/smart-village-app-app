import React from 'react';
import renderer from 'react-test-renderer';

import { AccessibilityContext } from '../src/AccessibilityProvider';
import { darkColors, lightColors } from '../src/config/colors';
import { useTheme } from '../src/hooks/useTheme';
import { AppThemeProvider } from '../src/ThemeProvider';

const ThemeProbe = () => {
  const theme = useTheme();

  return React.createElement('theme-probe', theme);
};

describe('AppThemeProvider', () => {
  it.each([
    ['light', lightColors, false],
    ['dark', darkColors, true]
  ] as const)('exposes the resolved %s theme to app consumers', (mode, colors, isDark) => {
    let tree: renderer.ReactTestRenderer;

    renderer.act(() => {
      tree = renderer.create(
        <AccessibilityContext.Provider
          value={{ resolvedThemeMode: mode, themeColors: colors } as never}
        >
          <AppThemeProvider>
            <ThemeProbe />
          </AppThemeProvider>
        </AccessibilityContext.Provider>
      );
    });

    expect(tree!.root.findByType('theme-probe').props).toMatchObject({
      colors,
      isDark,
      mode
    });
  });
});
