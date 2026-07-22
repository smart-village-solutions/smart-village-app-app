import { ResolvedThemeMode, ThemeColorPalette, ThemeMode } from './Theme';

export type AccessibilitySystemState = {
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isScreenReaderEnabled: boolean;
};

export type AccessibilityTogglePreferenceKey =
  | 'boldTextEnabled'
  | 'isGrayscaleEnabled'
  | 'highContrastEnabled'
  | 'readAloudEnabled'
  | 'reduceMotionEnabled'
  | 'reduceTransparencyEnabled';

export type AccessibilityPreferenceKey =
  | AccessibilityTogglePreferenceKey
  | 'textScaleLevel'
  | 'themeMode';

export type AccessibilityUserSettings = {
  boldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  highContrastEnabled: boolean;
  readAloudEnabled: boolean;
  reduceMotionEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  textScaleLevel: number;
  themeMode: ThemeMode;
};

export type AccessibilityFeatureKey =
  | 'isGrayscaleEnabled'
  | 'textScaling'
  | 'boldText'
  | 'highContrast'
  | 'readAloud'
  | 'reduceMotion'
  | 'reduceTransparency'
  | 'headerEntry'
  | 'settingsEntry'
  | 'theming';

export type AccessibilityFeatureAvailability = Record<AccessibilityFeatureKey, boolean>;

export type AccessibilityContextValue = AccessibilitySystemState & {
  defaults: AccessibilityUserSettings;
  features: AccessibilityFeatureAvailability;
  isHighContrastEnabled: boolean;
  isHydrated: boolean;
  isReadAloudEnabled: boolean;
  resolvedThemeMode: ResolvedThemeMode;
  preferences: AccessibilityUserSettings;
  resetPreferences: () => void;
  setPreference: (key: AccessibilityTogglePreferenceKey, value?: boolean) => void;
  setPreferences: (values: Partial<AccessibilityUserSettings>) => void;
  setTextScaleLevel: (level: number) => void;
  setThemeMode: (mode: ThemeMode) => void;
  system: AccessibilitySystemState;
  themeColors: ThemeColorPalette;
  themeMode: ThemeMode;
  textScaleMultiplier: number;
};
