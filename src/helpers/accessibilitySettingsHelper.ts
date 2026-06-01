import {
  AccessibilityFeatureAvailability,
  AccessibilityFeatureKey,
  AccessibilityTogglePreferenceKey,
  AccessibilityUserSettings
} from '../types';

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
  textScaling: false
};

export const DEFAULT_ACCESSIBILITY_USER_SETTINGS: AccessibilityUserSettings = {
  boldTextEnabled: false,
  isGrayscaleEnabled: false,
  highContrastEnabled: false,
  readAloudEnabled: false,
  reduceMotionEnabled: false,
  reduceTransparencyEnabled: false,
  textScaleLevel: DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL
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
    boldTextEnabled:
      typeof defaultSettings.boldTextEnabled === 'boolean'
        ? defaultSettings.boldTextEnabled
        : typeof defaultSettings.boldText === 'boolean'
        ? defaultSettings.boldText
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.boldTextEnabled,
    isGrayscaleEnabled:
      typeof defaultSettings.isGrayscaleEnabled === 'boolean'
        ? defaultSettings.isGrayscaleEnabled
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.isGrayscaleEnabled,
    highContrastEnabled:
      typeof defaultSettings.highContrastEnabled === 'boolean'
        ? defaultSettings.highContrastEnabled
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.highContrastEnabled,
    readAloudEnabled:
      typeof defaultSettings.readAloudEnabled === 'boolean'
        ? defaultSettings.readAloudEnabled
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.readAloudEnabled,
    reduceMotionEnabled:
      typeof defaultSettings.reduceMotionEnabled === 'boolean'
        ? defaultSettings.reduceMotionEnabled
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.reduceMotionEnabled,
    reduceTransparencyEnabled:
      typeof defaultSettings.reduceTransparencyEnabled === 'boolean'
        ? defaultSettings.reduceTransparencyEnabled
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.reduceTransparencyEnabled,
    textScaleLevel:
      typeof defaultSettings.textScaleLevel === 'number'
        ? normalizeTextScaleLevel(defaultSettings.textScaleLevel)
        : typeof defaultSettings.textScaling === 'number'
        ? normalizeTextScaleLevel(defaultSettings.textScaling)
        : DEFAULT_ACCESSIBILITY_USER_SETTINGS.textScaleLevel
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
