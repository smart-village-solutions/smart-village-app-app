import { useCallback, useContext, useMemo } from 'react';

import { AccessibilityContext } from '../AccessibilityProvider';
import { ACCESSIBILITY_FEATURE_BY_PREFERENCE } from '../helpers';
import { AccessibilityTogglePreferenceKey, AccessibilityUserSettings } from '../types';

export const useAccessibilityPreferences = () => {
  const {
    defaults,
    features,
    preferences,
    resetPreferences,
    setPreference,
    setPreferences,
    setTextScaleLevel,
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

        const typedKey = key as AccessibilityTogglePreferenceKey;
        if (isPreferenceAvailable(typedKey) && typeof value === 'boolean') {
          acc[typedKey] = value;
        }
        return acc;
      }, {} as Partial<AccessibilityUserSettings>);

      setPreferences(filteredValues);
    },
    [isPreferenceAvailable, isTextScalingAvailable, setPreferences]
  );

  return {
    availablePreferenceKeys,
    defaults,
    features,
    isPreferenceAvailable,
    isTextScalingAvailable,
    preferences,
    resetPreferences,
    setPreference: togglePreference,
    setPreferences: updatePreferences,
    setTextScaleLevel: (level: number) => {
      if (!isTextScalingAvailable) return;
      setTextScaleLevel(level);
    },
    textScaleMultiplier
  };
};
