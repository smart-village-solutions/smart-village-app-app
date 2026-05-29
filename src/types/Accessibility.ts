export type AccessibilitySystemState = {
  isBoldTextEnabled: boolean;
  isGrayscaleEnabled: boolean;
  isInvertColorsEnabled: boolean;
  isReduceMotionEnabled: boolean;
  isReduceTransparencyEnabled: boolean;
  isScreenReaderEnabled: boolean;
};

export type AccessibilityTogglePreferenceKey =
  | 'highContrastEnabled'
  | 'readAloudEnabled'
  | 'reduceMotionEnabled'
  | 'reduceTransparencyEnabled';

export type AccessibilityPreferenceKey = AccessibilityTogglePreferenceKey | 'textScaleLevel';

export type AccessibilityUserSettings = {
  highContrastEnabled: boolean;
  readAloudEnabled: boolean;
  reduceMotionEnabled: boolean;
  reduceTransparencyEnabled: boolean;
  textScaleLevel: number;
};

export type AccessibilityFeatureKey =
  | 'textScaling'
  | 'boldText'
  | 'highContrast'
  | 'readAloud'
  | 'reduceMotion'
  | 'reduceTransparency'
  | 'headerEntry'
  | 'settingsEntry';

export type AccessibilityFeatureAvailability = Record<AccessibilityFeatureKey, boolean>;

export type AccessibilityContextValue = AccessibilitySystemState & {
  defaults: AccessibilityUserSettings;
  features: AccessibilityFeatureAvailability;
  isHighContrastEnabled: boolean;
  isReadAloudEnabled: boolean;
  preferences: AccessibilityUserSettings;
  resetPreferences: () => void;
  setPreference: (key: AccessibilityTogglePreferenceKey, value?: boolean) => void;
  setPreferences: (values: Partial<AccessibilityUserSettings>) => void;
  setTextScaleLevel: (level: number) => void;
  system: AccessibilitySystemState;
  textScaleMultiplier: number;
};
