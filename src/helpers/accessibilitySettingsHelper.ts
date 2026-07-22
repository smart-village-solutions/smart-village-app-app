import { isThemeMode } from '../config/colors';
import {
  AccessibilityFeatureAvailability,
  AccessibilityFeatureKey,
  AccessibilityTogglePreferenceKey,
  AccessibilityUserSettings
} from '../types/Accessibility';

export const ACCESSIBILITY_FEATURE_BY_PREFERENCE: Record<
  AccessibilityTogglePreferenceKey,
  AccessibilityFeatureKey
> = {
  boldTextEnabled: 'boldText',
  isGrayscaleEnabled: 'isGrayscaleEnabled',
  highContrastEnabled: 'highContrast',
  readAloudEnabled: 'readAloud',
  reduceMotionEnabled: 'reduceMotion',
  reduceTransparencyEnabled: 'reduceTransparency'
};

export const ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS = [0.9, 0.95, 1, 1.1, 1.2, 1.3, 1.4] as const;
export const DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL = 2;

export const DEFAULT_ACCESSIBILITY_FEATURES: AccessibilityFeatureAvailability = {
  boldText: false,
  headerEntry: false,
  highContrast: false,
  isGrayscaleEnabled: false,
  readAloud: false,
  reduceMotion: false,
  reduceTransparency: false,
  settingsEntry: false,
  textScaling: false,
  theming: false
};

export const DEFAULT_ACCESSIBILITY_USER_SETTINGS: AccessibilityUserSettings = {
  boldTextEnabled: false,
  isGrayscaleEnabled: false,
  highContrastEnabled: false,
  readAloudEnabled: false,
  reduceMotionEnabled: false,
  reduceTransparencyEnabled: false,
  textScaleLevel: DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL,
  themeMode: 'system'
};

type AccessibilityGlobalSettings = {
  settings?: {
    accessibility?: {
      defaults?: Partial<AccessibilityUserSettings> & {
        boldText?: boolean;
        textScaling?: number;
      };
      enabledFeatures?: Partial<AccessibilityFeatureAvailability>;
    };
  };
};

const normalizeBooleanRecord = <T extends string>(
  values: Record<string, unknown> | undefined,
  defaults: Record<T, boolean>
) => {
  return Object.keys(defaults).reduce((acc, key) => {
    const typedKey = key as T;
    const value = values?.[typedKey];

    acc[typedKey] = typeof value === 'boolean' ? value : defaults[typedKey];
    return acc;
  }, {} as Record<T, boolean>);
};

export const normalizeTextScaleLevel = (value: unknown) => {
  const maxLevel = ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS.length - 1;
  const minLevel = 0;

  if (typeof value !== 'number' || Number.isNaN(value)) {
    return DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL;
  }

  return Math.min(maxLevel, Math.max(minLevel, Math.round(value)));
};

export const getTextScaleMultiplier = (textScaleLevel: number) =>
  ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS[normalizeTextScaleLevel(textScaleLevel)];

type AccessibilityDefaultsInput = Partial<AccessibilityUserSettings> & {
  boldText?: unknown;
  textScaling?: unknown;
};

const getBooleanSetting = (value: unknown, fallback: boolean) =>
  typeof value === 'boolean' ? value : fallback;

const getBoldTextDefault = (defaultSettings: AccessibilityDefaultsInput) => {
  if (typeof defaultSettings.boldTextEnabled === 'boolean') {
    return defaultSettings.boldTextEnabled;
  }

  if (typeof defaultSettings.boldText === 'boolean') {
    return defaultSettings.boldText;
  }

  return DEFAULT_ACCESSIBILITY_USER_SETTINGS.boldTextEnabled;
};

const getTextScaleDefault = (defaultSettings: AccessibilityDefaultsInput) => {
  if (typeof defaultSettings.textScaleLevel === 'number') {
    return normalizeTextScaleLevel(defaultSettings.textScaleLevel);
  }

  if (typeof defaultSettings.textScaling === 'number') {
    return normalizeTextScaleLevel(defaultSettings.textScaling);
  }

  return DEFAULT_ACCESSIBILITY_USER_SETTINGS.textScaleLevel;
};

/* eslint-disable complexity */
export const resolveAccessibilityConfiguration = (
  globalSettings?: AccessibilityGlobalSettings | null
) => {
  const accessibilitySettings = globalSettings?.settings?.accessibility || {};
  const featureSettings = accessibilitySettings?.enabledFeatures || {};
  const defaultSettings = accessibilitySettings?.defaults || {};

  const enabledFeatures = normalizeBooleanRecord<AccessibilityFeatureKey>(
    featureSettings,
    DEFAULT_ACCESSIBILITY_FEATURES
  );

  const defaults: AccessibilityUserSettings = {
    ...DEFAULT_ACCESSIBILITY_USER_SETTINGS,
    boldTextEnabled: getBoldTextDefault(defaultSettings),
    isGrayscaleEnabled: getBooleanSetting(
      defaultSettings.isGrayscaleEnabled,
      DEFAULT_ACCESSIBILITY_USER_SETTINGS.isGrayscaleEnabled
    ),
    highContrastEnabled: getBooleanSetting(
      defaultSettings.highContrastEnabled,
      DEFAULT_ACCESSIBILITY_USER_SETTINGS.highContrastEnabled
    ),
    readAloudEnabled: getBooleanSetting(
      defaultSettings.readAloudEnabled,
      DEFAULT_ACCESSIBILITY_USER_SETTINGS.readAloudEnabled
    ),
    reduceMotionEnabled: getBooleanSetting(
      defaultSettings.reduceMotionEnabled,
      DEFAULT_ACCESSIBILITY_USER_SETTINGS.reduceMotionEnabled
    ),
    reduceTransparencyEnabled: getBooleanSetting(
      defaultSettings.reduceTransparencyEnabled,
      DEFAULT_ACCESSIBILITY_USER_SETTINGS.reduceTransparencyEnabled
    ),
    textScaleLevel: getTextScaleDefault(defaultSettings),
    themeMode: isThemeMode(defaultSettings.themeMode)
      ? defaultSettings.themeMode
      : DEFAULT_ACCESSIBILITY_USER_SETTINGS.themeMode
  };

  return {
    defaults,
    features: enabledFeatures
  };
};
/* eslint-enable complexity */

export const isAccessibilityFeatureEnabled = (
  globalSettings: AccessibilityGlobalSettings | null | undefined,
  feature: AccessibilityFeatureKey
) => resolveAccessibilityConfiguration(globalSettings).features[feature] !== false;

export const getAccessibilitySettingsEntryEnabled = (
  globalSettings: AccessibilityGlobalSettings | null | undefined
) => isAccessibilityFeatureEnabled(globalSettings, 'settingsEntry');

export const getAccessibilityHeaderEntryEnabled = (
  globalSettings: AccessibilityGlobalSettings | null | undefined
) => isAccessibilityFeatureEnabled(globalSettings, 'headerEntry');
