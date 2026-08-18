import { createContext } from 'react';

import { lightColors } from './config/colors';
import { ResolvedThemeMode, ThemeColorPalette } from './types/Theme';

export type AppThemeContextValue = {
  colors: ThemeColorPalette;
  isDark: boolean;
  mode: ResolvedThemeMode;
};

export const ThemeContext = createContext<AppThemeContextValue>({
  colors: lightColors,
  isDark: false,
  mode: 'light'
});
