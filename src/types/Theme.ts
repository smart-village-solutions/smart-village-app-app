export type ThemeMode = 'light' | 'dark' | 'system';

export type ResolvedThemeMode = Exclude<ThemeMode, 'system'>;

export type ThemeColorPalette = {
  accent: string;
  background: string;
  backgroundRgba: string;
  blue: string;
  border: string;
  borderRgba: string;
  calendarBackground: string;
  calendarSelected: string;
  calendarSelectedDayText: string;
  calendarTodayText: string;
  darkText: string;
  darkerPrimary: string;
  darkerPrimaryRgba: string;
  error: string;
  errorRgba: string;
  gray20: string;
  gray40: string;
  gray60: string;
  lighterPrimary: string;
  lighterPrimaryRgba: string;
  lightestText: string;
  onPrimary: string;
  overlayRgba: string;
  placeholder: string;
  primary: string;
  refreshControl: string;
  secondary: string;
  shadow: string;
  shadowRgba: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textMuted: string;
  transparent: string;
};

export type ThemePaletteOverrides = Partial<Record<keyof ThemeColorPalette, unknown>>;

export type ThemePalettesConfig = Partial<Record<ResolvedThemeMode, ThemePaletteOverrides>>;

export type ThemeGlobalSettings = {
  settings?: {
    accessibility?: {
      themePalettes?: ThemePalettesConfig;
    };
  };
};
