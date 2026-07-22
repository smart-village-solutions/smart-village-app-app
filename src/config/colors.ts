import { ResolvedThemeMode, ThemeColorPalette, ThemeMode } from '../types/Theme';

const white = '#FFFFFF';
const black = '#141414';
const gray20 = '#EAEAEA';
const gray40 = '#DBDBE6';
const gray60 = '#BCBBC1';
const gray80 = '#A2A2A2';

export const lightColors: ThemeColorPalette = Object.freeze({
  lighterPrimaryRgba: 'rgba(15, 70, 24, 0.1)',
  lighterPrimary: '#5EC66F',
  primary: '#107821',
  darkerPrimary: 'rgb(15, 70, 24)',
  darkerPrimaryRgba: 'rgba(15, 70, 24, 0.6)',
  secondary: 'rgb(9, 72, 60)',
  accent: 'rgb(15, 70, 24)',
  blue: '#5C7ADB',

  error: 'rgb(174, 0, 29)',
  errorRgba: 'rgba(174, 0, 29, 0.1)',

  background: white,
  surface: white,
  surfaceElevated: white,
  text: black,
  textMuted: '#595959',
  onPrimary: white,
  border: gray40,

  // Legacy aliases remain available while consumers migrate to semantic tokens.
  darkText: black,
  lightestText: white,

  shadow: gray60,
  shadowRgba: 'rgba(188, 187, 193, 0.4)',
  placeholder: gray80,
  backgroundRgba: 'rgba(162, 162, 162, 0.08)',
  borderRgba: 'rgba(162, 162, 162, 0.75)',
  overlayRgba: 'rgba(20, 20, 20, 0.7)',

  calendarBackground: white,
  calendarTodayText: '#107821',
  calendarSelectedDayText: black,
  calendarSelected: '#5EC66F',
  transparent: 'transparent',
  gray20,
  gray40,
  gray60,

  refreshControl: 'rgb(15, 70, 24)'
});

export const darkColors: ThemeColorPalette = Object.freeze({
  lighterPrimaryRgba: 'rgba(94, 198, 111, 0.18)',
  lighterPrimary: '#8AD996',
  primary: '#5EC66F',
  darkerPrimary: '#8AD996',
  darkerPrimaryRgba: 'rgba(138, 217, 150, 0.65)',
  secondary: '#73D6C2',
  accent: '#8AD996',
  blue: '#91A7FF',

  error: '#FF8A9D',
  errorRgba: 'rgba(255, 138, 157, 0.18)',

  background: '#121212',
  surface: '#1E1E1E',
  surfaceElevated: '#2A2A2A',
  text: '#F5F5F5',
  textMuted: '#C7C7CC',
  onPrimary: black,
  border: '#54545A',

  // Legacy aliases map to their semantic dark-theme equivalents.
  darkText: '#F5F5F5',
  lightestText: black,

  shadow: '#000000',
  shadowRgba: 'rgba(0, 0, 0, 0.55)',
  placeholder: '#AFAFB5',
  backgroundRgba: 'rgba(255, 255, 255, 0.08)',
  borderRgba: 'rgba(199, 199, 204, 0.75)',
  overlayRgba: 'rgba(0, 0, 0, 0.78)',

  calendarBackground: '#1E1E1E',
  calendarTodayText: '#8AD996',
  calendarSelectedDayText: black,
  calendarSelected: '#8AD996',
  transparent: 'transparent',
  gray20: '#2A2A2A',
  gray40: '#54545A',
  gray60: '#85858D',

  refreshControl: '#8AD996'
});

export const themePalettes: Record<ResolvedThemeMode, ThemeColorPalette> = Object.freeze({
  dark: darkColors,
  light: lightColors
});

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'dark' || value === 'light' || value === 'system';

export const resolveThemeMode = (
  preference: ThemeMode,
  systemColorScheme?: ResolvedThemeMode | null
): ResolvedThemeMode => (preference === 'system' ? systemColorScheme || 'light' : preference);

export const getThemePalette = (mode: ResolvedThemeMode): ThemeColorPalette => themePalettes[mode];

// Backwards-compatible light palette. Dynamic consumers will migrate to the theme context.
export const colors = lightColors;
