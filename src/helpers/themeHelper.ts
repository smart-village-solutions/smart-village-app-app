import { darkColors, lightColors } from '../config/colors';
import {
  ResolvedThemeMode,
  ThemeColorPalette,
  ThemeGlobalSettings,
  ThemePaletteOverrides
} from '../types/Theme';

const MINIMUM_NORMAL_TEXT_CONTRAST = 4.5;
const HEX_COLOR_PATTERN = /^#(?:[\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
const RGB_COLOR_PATTERN = /^(rgba?)\(([^)]+)\)$/i;

const CRITICAL_CONTRAST_PAIRS: Array<[keyof ThemeColorPalette, keyof ThemeColorPalette]> = [
  ['text', 'background'],
  ['text', 'surface'],
  ['textMuted', 'background'],
  ['textMuted', 'surface'],
  ['onPrimary', 'primary'],
  ['error', 'background']
];

type RgbColor = {
  alpha: number;
  blue: number;
  green: number;
  red: number;
};

const isByte = (value: number) => Number.isInteger(value) && value >= 0 && value <= 255;

const parseRgbColor = (value: string): RgbColor | undefined => {
  const match = RGB_COLOR_PATTERN.exec(value);
  if (!match) return undefined;

  const channels = match[2].split(',').map((channel) => Number(channel.trim()));
  const expectsAlpha = match[1].toLowerCase() === 'rgba';
  if (channels.length !== (expectsAlpha ? 4 : 3)) return undefined;

  const [red, green, blue, alpha = 1] = channels;
  if (![red, green, blue].every(isByte) || alpha < 0 || alpha > 1) return undefined;

  return { alpha, blue, green, red };
};

const parseHexColor = (value: string): RgbColor | undefined => {
  if (!HEX_COLOR_PATTERN.test(value)) return undefined;

  const compactHex = value.slice(1);
  const expandedHex =
    compactHex.length <= 4
      ? compactHex
          .split('')
          .map((character) => `${character}${character}`)
          .join('')
      : compactHex;
  const hasAlpha = expandedHex.length === 8;

  return {
    red: Number.parseInt(expandedHex.slice(0, 2), 16),
    green: Number.parseInt(expandedHex.slice(2, 4), 16),
    blue: Number.parseInt(expandedHex.slice(4, 6), 16),
    alpha: hasAlpha ? Number.parseInt(expandedHex.slice(6, 8), 16) / 255 : 1
  };
};

const parseColor = (value: string) => parseHexColor(value) || parseRgbColor(value);

export const isValidThemeColor = (value: unknown): value is string =>
  typeof value === 'string' &&
  (value === 'transparent' || HEX_COLOR_PATTERN.test(value) || !!parseRgbColor(value));

const linearizeColorChannel = (channel: number) => {
  const normalizedChannel = channel / 255;
  return normalizedChannel <= 0.04045
    ? normalizedChannel / 12.92
    : ((normalizedChannel + 0.055) / 1.055) ** 2.4;
};

const getRelativeLuminance = ({ red, green, blue }: RgbColor) =>
  0.2126 * linearizeColorChannel(red) +
  0.7152 * linearizeColorChannel(green) +
  0.0722 * linearizeColorChannel(blue);

export const getContrastRatio = (foreground: string, background: string) => {
  const foregroundColor = parseColor(foreground);
  const backgroundColor = parseColor(background);

  if (!foregroundColor || !backgroundColor) return undefined;
  if (foregroundColor.alpha !== 1 || backgroundColor.alpha !== 1) return undefined;

  const foregroundLuminance = getRelativeLuminance(foregroundColor);
  const backgroundLuminance = getRelativeLuminance(backgroundColor);
  const lighter = Math.max(foregroundLuminance, backgroundLuminance);
  const darker = Math.min(foregroundLuminance, backgroundLuminance);

  return (lighter + 0.05) / (darker + 0.05);
};

const sanitizeOverrides = (basePalette: ThemeColorPalette, overrides?: ThemePaletteOverrides) => {
  if (!overrides || typeof overrides !== 'object') return {};

  return Object.entries(overrides).reduce((validOverrides, [token, value]) => {
    if (token in basePalette && isValidThemeColor(value)) {
      validOverrides[token as keyof ThemeColorPalette] = value;
    }

    return validOverrides;
  }, {} as Partial<ThemeColorPalette>);
};

const synchronizeLegacyAliases = (
  palette: ThemeColorPalette,
  overrides: Partial<ThemeColorPalette>
) => {
  if (overrides.text) palette.darkText = palette.text;
  if (overrides.onPrimary) palette.lightestText = palette.onPrimary;
};

const applyContrastFallbacks = (palette: ThemeColorPalette, basePalette: ThemeColorPalette) => {
  CRITICAL_CONTRAST_PAIRS.forEach(([foregroundToken, backgroundToken]) => {
    const contrastRatio = getContrastRatio(palette[foregroundToken], palette[backgroundToken]);

    if (contrastRatio === undefined || contrastRatio < MINIMUM_NORMAL_TEXT_CONTRAST) {
      palette[foregroundToken] = basePalette[foregroundToken];
      palette[backgroundToken] = basePalette[backgroundToken];
    }
  });
};

export const resolveThemePalette = (
  basePalette: ThemeColorPalette,
  overrides?: ThemePaletteOverrides
): ThemeColorPalette => {
  const validOverrides = sanitizeOverrides(basePalette, overrides);
  const palette = { ...basePalette, ...validOverrides };

  applyContrastFallbacks(palette, basePalette);
  synchronizeLegacyAliases(palette, validOverrides);

  return Object.freeze(palette);
};

export const resolveThemePalettes = (globalSettings?: ThemeGlobalSettings | null) => {
  const configuredPalettes = globalSettings?.settings?.accessibility?.themePalettes;

  return Object.freeze({
    dark: resolveThemePalette(darkColors, configuredPalettes?.dark),
    light: resolveThemePalette(lightColors, configuredPalettes?.light)
  }) satisfies Record<ResolvedThemeMode, ThemeColorPalette>;
};
