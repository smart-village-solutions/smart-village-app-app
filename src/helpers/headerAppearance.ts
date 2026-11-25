import type { HeaderThemeAppearance, ThemeColorPalette } from '../types/Theme';

import { getContrastRatio, isValidThemeColor } from './themeHelper';

const BLACK = '#000000';
const WHITE = '#FFFFFF';

export const sanitizeHeaderAppearance = (
  config?: Partial<Record<keyof HeaderThemeAppearance, unknown>>
): HeaderThemeAppearance => ({
  backgroundColor: isValidThemeColor(config?.backgroundColor) ? config.backgroundColor : undefined,
  gradientColors:
    Array.isArray(config?.gradientColors) &&
    config.gradientColors.length >= 2 &&
    config.gradientColors.every(isValidThemeColor)
      ? (config.gradientColors as [string, string, ...string[]])
      : undefined,
  tintColor: isValidThemeColor(config?.tintColor) ? config.tintColor : undefined
});

export const resolveHeaderBackgroundColors = (
  fallback: string,
  configured: HeaderThemeAppearance,
  background?: string,
  gradient?: readonly [string, string, ...string[]]
): readonly string[] => {
  const stops =
    gradient ??
    (background !== undefined
      ? [background, background]
      : configured.gradientColors ?? [
          configured.backgroundColor ?? fallback,
          configured.backgroundColor ?? fallback
        ]);
  // Translucent or unsupported backgrounds cannot provide predictable content contrast.
  return stops.map((color) => (getContrastRatio(BLACK, color) === undefined ? fallback : color));
};

export const resolveHeaderForeground = (
  colors: ThemeColorPalette,
  background: string | readonly string[],
  tintColor?: string
) => {
  if (tintColor) return tintColor;
  const backgrounds = typeof background === 'string' ? [background] : background;
  if (backgrounds.every((color) => color === colors.primary)) return colors.onPrimary;

  const minimumContrast = (foreground: string) =>
    Math.min(...backgrounds.map((color) => getContrastRatio(foreground, color) ?? 0));

  const textContrast = minimumContrast(colors.text);
  if (textContrast === 0 || textContrast >= 4.5) return colors.text;

  return minimumContrast(WHITE) > minimumContrast(BLACK) ? WHITE : BLACK;
};
