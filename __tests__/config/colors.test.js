import {
  colors,
  darkColors,
  getThemePalette,
  isThemeMode,
  lightColors,
  resolveThemeMode,
  themePalettes
} from '../../src/config';

describe('color', () => {
  it('lighterPrimary is defined', () => {
    expect(colors.lighterPrimary).toBeTruthy();
  });

  it('primary is defined', () => {
    expect(colors.primary).toBeTruthy();
  });

  it('darkerPrimary is defined', () => {
    expect(colors.darkerPrimary).toBeTruthy();
  });

  it('darkerPrimaryRgba is defined', () => {
    expect(colors.darkerPrimaryRgba).toBeTruthy();
  });

  it('secondary is defined', () => {
    expect(colors.secondary).toBeTruthy();
  });

  it('accent is defined', () => {
    expect(colors.accent).toBeTruthy();
  });

  it('error is defined', () => {
    expect(colors.error).toBeTruthy();
  });

  it('darkText is defined', () => {
    expect(colors.darkText).toBeTruthy();
  });

  it('lightestText is defined', () => {
    expect(colors.lightestText).toBeTruthy();
  });

  it('shadow is defined', () => {
    expect(colors.shadow).toBeTruthy();
  });

  it('shadowRgba is defined', () => {
    expect(colors.shadowRgba).toBeTruthy();
  });

  it('placeholder is defined', () => {
    expect(colors.placeholder).toBeTruthy();
  });

  it('backgroundRgba is defined', () => {
    expect(colors.backgroundRgba).toBeTruthy();
  });

  it('borderRgba is defined', () => {
    expect(colors.borderRgba).toBeTruthy();
  });

  it('overlayRgba is defined', () => {
    expect(colors.overlayRgba).toBeTruthy();
  });

  it('surface is defined', () => {
    expect(colors.surface).toBeTruthy();
  });

  it('transparent is defined', () => {
    expect(colors.transparent).toBeTruthy();
  });

  it('gray20 is defined', () => {
    expect(colors.gray20).toBeTruthy();
  });

  it('gray40 is defined', () => {
    expect(colors.gray40).toBeTruthy();
  });

  it('gray60 is defined', () => {
    expect(colors.gray60).toBeTruthy();
  });

  it('keeps the existing colors export mapped to the light palette', () => {
    expect(colors).toBe(lightColors);
  });

  it('provides complete semantic tokens for both themes', () => {
    const semanticTokens = [
      'background',
      'border',
      'onPrimary',
      'surface',
      'surfaceElevated',
      'text',
      'textMuted'
    ];

    semanticTokens.forEach((token) => {
      expect(lightColors[token]).toBeTruthy();
      expect(darkColors[token]).toBeTruthy();
    });

    expect(Object.keys(darkColors).sort()).toEqual(Object.keys(lightColors).sort());
    expect(themePalettes).toEqual({ dark: darkColors, light: lightColors });
  });

  it('resolves explicit and system theme modes', () => {
    expect(resolveThemeMode('light', 'dark')).toBe('light');
    expect(resolveThemeMode('dark', 'light')).toBe('dark');
    expect(resolveThemeMode('system', 'dark')).toBe('dark');
    expect(resolveThemeMode('system', null)).toBe('light');
    expect(getThemePalette('dark')).toBe(darkColors);
  });

  it('accepts only supported theme mode values', () => {
    expect(isThemeMode('light')).toBe(true);
    expect(isThemeMode('dark')).toBe(true);
    expect(isThemeMode('system')).toBe(true);
    expect(isThemeMode('sepia')).toBe(false);
    expect(isThemeMode(null)).toBe(false);
  });
});
