import { getContrastRatio, resolveGrayscaleConfiguration } from '../helpers/themeHelper';
import type { AccessibilityContextValue } from '../types/Accessibility';
import type { ThemeColorPalette } from '../types/Theme';

import type { CardStyles, KlimaTalerWidgetConfiguration } from './widgetConfiguration';

type Preferences = Pick<
  AccessibilityContextValue,
  'isHighContrastEnabled' | 'isReduceTransparencyEnabled' | 'isGrayscaleEnabled'
>;

const accessibleStyles = (styles: CardStyles, highContrast: boolean) => {
  const result = { ...styles };
  for (const slot of Object.keys(styles) as (keyof CardStyles)[]) {
    const style = { ...styles[slot], opacity: 1 };
    for (const key of Object.keys(style)) {
      if (!key.toLowerCase().endsWith('color')) continue;
      const value = (style as Record<string, unknown>)[key];
      if (
        highContrast ||
        (typeof value === 'string' && getContrastRatio(value, value) === undefined)
      ) {
        delete (style as Record<string, unknown>)[key];
      }
    }
    Object.assign(result, { [slot]: style });
  }
  return result;
};

export const accessibleKlimaTalerConfiguration = (
  config: KlimaTalerWidgetConfiguration,
  palette: ThemeColorPalette,
  preferences: Preferences
): KlimaTalerWidgetConfiguration => {
  const { isHighContrastEnabled, isReduceTransparencyEnabled, isGrayscaleEnabled } = preferences;
  const colors = { ...config.colors };
  const styles = { ...config.styles };
  if (isHighContrastEnabled || isReduceTransparencyEnabled) {
    const fallback = {
      background: palette.surface,
      text: palette.text,
      button: palette.text,
      buttonText: palette.surface,
      shortcut: palette.surface,
      shortcutIcon: palette.text
    };
    const pairs = [
      ['background', 'text'],
      ['button', 'buttonText'],
      ['shortcut', 'shortcutIcon']
    ] as const;
    for (const pair of pairs) {
      // Change foreground and background together to preserve a readable pair.
      if (
        isHighContrastEnabled ||
        pair.some((key) => getContrastRatio(colors[key], colors[key]) === undefined)
      ) {
        for (const key of pair) colors[key] = fallback[key];
      }
    }
    Object.assign(styles, accessibleStyles(styles, isHighContrastEnabled));
    styles.card = { ...styles.card, borderWidth: 1, borderColor: colors.text };
    styles.shortcut = { ...styles.shortcut, borderWidth: 1, borderColor: colors.shortcutIcon };
  }
  const result = {
    ...config,
    colors,
    styles,
    logo: { ...config.logo, color: isHighContrastEnabled ? colors.text : config.logo.color }
  };
  // Only appearance is converted; remotely configured copy and URLs remain intact.
  return isGrayscaleEnabled
    ? {
        ...result,
        colors: resolveGrayscaleConfiguration(colors),
        styles: resolveGrayscaleConfiguration(styles),
        logo: { ...result.logo, color: resolveGrayscaleConfiguration(result.logo.color) }
      }
    : result;
};
