import { useCallback, useContext, useMemo } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { isThemeMode } from '../config/colors';
import { ACCESSIBILITY_FEATURE_BY_PREFERENCE } from '../helpers/accessibilitySettingsHelper';
import {
  AccessibilityTogglePreferenceKey,
  AccessibilityUserSettings
} from '../types/Accessibility';

export const useAccessibilityPreferences = () => {
  const {
    defaults,
    features,
    isGrayscaleEnabled,
    isHighContrastEnabled,
    preferences,
    resetPreferences,
    resolvedThemeMode,
    setPreference,
    setPreferences,
    setTextScaleLevel,
    setThemeMode,
    themeColors,
    themeMode,
    textScaleMultiplier
  } = useContext(AccessibilityContext);

  const isPreferenceAvailable = useCallback(
    (key: AccessibilityTogglePreferenceKey) => {
      return features[ACCESSIBILITY_FEATURE_BY_PREFERENCE[key]] !== false;
    },
    [features]
  );

  const isTextScalingAvailable = features.textScaling !== false;

  const availablePreferenceKeys = useMemo(
    () =>
      (
        Object.keys(ACCESSIBILITY_FEATURE_BY_PREFERENCE) as AccessibilityTogglePreferenceKey[]
      ).filter((key) => isPreferenceAvailable(key)),
    [isPreferenceAvailable]
  );

  const togglePreference = useCallback(
    (key: AccessibilityTogglePreferenceKey, value?: boolean) => {
      if (!isPreferenceAvailable(key)) return;
      setPreference(key, value);
    },
    [isPreferenceAvailable, setPreference]
  );

  const updatePreferences = useCallback(
    (values: Partial<AccessibilityUserSettings>) => {
      const filteredValues = Object.entries(values).reduce((acc, [key, value]) => {
        if (key === 'textScaleLevel') {
          if (isTextScalingAvailable && typeof value === 'number') {
            acc.textScaleLevel = value;
          }
          return acc;
        }

        if (key === 'themeMode') {
          if (features.theming && isThemeMode(value)) {
            acc.themeMode = value;
          }
          return acc;
        }

        const typedKey = key as AccessibilityTogglePreferenceKey;
        if (isPreferenceAvailable(typedKey) && typeof value === 'boolean') {
          acc[typedKey] = value;
        }
        return acc;
      }, {} as Partial<AccessibilityUserSettings>);

      setPreferences(filteredValues);
    },
    [features.theming, isPreferenceAvailable, isTextScalingAvailable, setPreferences]
  );

  return {
    availablePreferenceKeys,
    defaults,
    features,
    isGrayscaleEnabled,
    isHighContrastEnabled,
    isPreferenceAvailable,
    isTextScalingAvailable,
    isThemingAvailable: features.theming !== false,
    preferences,
    resetPreferences,
    resolvedThemeMode,
    setPreference: togglePreference,
    setPreferences: updatePreferences,
    setTextScaleLevel: (level: number) => {
      if (!isTextScalingAvailable) return;
      setTextScaleLevel(level);
    },
    setThemeMode: (mode: AccessibilityUserSettings['themeMode']) => {
      if (features.theming === false) return;
      setThemeMode(mode);
    },
    themeColors,
    themeMode,
    textScaleMultiplier
  };
};
