import { darkColors, lightColors } from '../../src/config/colors';
import {
  getContrastRatio,
  isValidThemeColor,
  resolveThemePalette,
  resolveThemePalettes
} from '../../src/helpers/themeHelper';

describe('themeHelper', () => {
  it('accepts supported JSON color formats and rejects invalid values', () => {
    expect(isValidThemeColor('#123')).toBe(true);
    expect(isValidThemeColor('#123456')).toBe(true);
    expect(isValidThemeColor('rgb(16, 120, 33)')).toBe(true);
    expect(isValidThemeColor('rgba(16, 120, 33, 0.5)')).toBe(true);
    expect(isValidThemeColor('transparent')).toBe(true);

    expect(isValidThemeColor('#12')).toBe(false);
    expect(isValidThemeColor('rgb(300, 0, 0)')).toBe(false);
    expect(isValidThemeColor('rgba(0, 0, 0, 2)')).toBe(false);
    expect(isValidThemeColor('green')).toBe(false);
    expect(isValidThemeColor(123)).toBe(false);
  });

  it('calculates WCAG contrast ratios for opaque colors', () => {
    expect(getContrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21);
    expect(getContrastRatio('rgb(0, 0, 0)', 'rgb(255, 255, 255)')).toBeCloseTo(21);
    expect(getContrastRatio('rgba(0, 0, 0, 0.5)', '#FFFFFF')).toBeUndefined();
  });

  it('merges valid partial palette overrides and synchronizes legacy text aliases', () => {
    const palette = resolveThemePalette(lightColors, {
      background: '#FAFAFA',
      onPrimary: '#FFFFFF',
      primary: '#0000AA',
      text: '#1A1A1A',
      unknownToken: '#123456'
    } as never);

    expect(palette.background).toBe('#FAFAFA');
    expect(palette.primary).toBe('#0000AA');
    expect(palette.text).toBe('#1A1A1A');
    expect(palette.darkText).toBe('#1A1A1A');
    expect(palette.lightestText).toBe('#FFFFFF');
    expect(palette.surface).toBe(lightColors.surface);
    expect(Object.isFrozen(palette)).toBe(true);
  });

  it('ignores malformed colors and repairs foreground contrast without replacing brand colors', () => {
    const palette = resolveThemePalette(lightColors, {
      border: 'not-a-color',
      onPrimary: '#FFFFFF',
      primary: '#FFFFFF',
      text: '#FFFFFF'
    });

    expect(palette.border).toBe(lightColors.border);
    expect(palette.primary).toBe('#FFFFFF');
    expect(palette.onPrimary).toBe('#141414');
    expect(palette.text).toBe(lightColors.text);
  });

  it('keeps Magdeburg GlobalSettings colors instead of reverting to the base palette', () => {
    const palettes = resolveThemePalettes({
      settings: {
        accessibility: {
          themePalettes: {
            dark: {
              background: '#121212',
              border: '#54545A',
              onPrimary: '#141414',
              placeholder: '#AFAFB5',
              primary: '#C44D36',
              surface: '#1E1E1E',
              surfaceElevated: '#2A2A2A',
              text: '#F5F5F5',
              textMuted: '#C7C7CC'
            }
          }
        }
      }
    });

    expect(palettes.dark).toMatchObject({
      background: '#121212',
      border: '#54545A',
      darkerPrimary: '#C44D36',
      lighterPrimary: '#C44D36',
      placeholder: '#AFAFB5',
      primary: '#C44D36',
      refreshControl: '#C44D36',
      surface: '#1E1E1E',
      surfaceElevated: '#2A2A2A',
      text: '#F5F5F5',
      textMuted: '#C7C7CC'
    });
    expect(getContrastRatio(palettes.dark.onPrimary, palettes.dark.primary)).toBeGreaterThanOrEqual(
      4.5
    );
  });

  it('resolves light and dark overrides from GlobalSettings independently', () => {
    const palettes = resolveThemePalettes({
      settings: {
        accessibility: {
          themePalettes: {
            dark: {
              border: '#67676F'
            },
            light: {
              border: '#C5C5CC'
            }
          }
        }
      }
    });

    expect(palettes.light.border).toBe('#C5C5CC');
    expect(palettes.dark.border).toBe('#67676F');
    expect(palettes.light.background).toBe(lightColors.background);
    expect(palettes.dark.background).toBe(darkColors.background);
    expect(Object.isFrozen(palettes)).toBe(true);
  });

  it('keeps the built-in palettes accessible for critical color pairs', () => {
    const palettes = resolveThemePalettes();

    [palettes.light, palettes.dark].forEach((palette) => {
      expect(getContrastRatio(palette.text, palette.background)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(palette.text, palette.surface)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(palette.textMuted, palette.background)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(palette.onPrimary, palette.primary)).toBeGreaterThanOrEqual(4.5);
      expect(getContrastRatio(palette.error, palette.background)).toBeGreaterThanOrEqual(4.5);
    });
  });
});
