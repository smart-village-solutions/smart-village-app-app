import type { StatusBarStyle } from 'react-native';

import type { ThemeColorPalette } from '../types/Theme';

import { getContrastRatio } from './themeHelper';

const BLACK = '#000000';
const WHITE = '#FFFFFF';

export const resolveHeaderForeground = (
  colors: ThemeColorPalette,
  background: string,
  tintColor?: string
) => {
  if (tintColor) return tintColor;
  if (background === colors.primary) return colors.onPrimary;

  const textContrast = getContrastRatio(colors.text, background);
  if (textContrast === undefined || textContrast >= 4.5) return colors.text;

  return (getContrastRatio(WHITE, background) ?? 0) > (getContrastRatio(BLACK, background) ?? 0)
    ? WHITE
    : BLACK;
};

export const resolveHeaderStatusBarStyle = (foreground: string): StatusBarStyle =>
  (getContrastRatio(foreground, BLACK) ?? 0) > (getContrastRatio(foreground, WHITE) ?? 0)
    ? 'light-content'
    : 'dark-content';
