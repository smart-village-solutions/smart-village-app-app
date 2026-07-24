import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import {
  ACCESSIBILITY_FEATURE_BY_PREFERENCE,
  getTextScaleMultiplier,
  normalizeTextScaleLevel,
  accessibilityListeners,
  resolveAccessibilityConfiguration,
  storageHelper
} from './helpers';
import { SettingsContext } from './SettingsProvider';
import {
  AccessibilityContextValue,
  AccessibilitySystemState,
  AccessibilityTogglePreferenceKey,
  AccessibilityUserSettings
} from './types';

const defaultSystemAccessibility: AccessibilitySystemState = {
  isBoldTextEnabled: false,
  isGrayscaleEnabled: false,
  isInvertColorsEnabled: false,
  isReduceMotionEnabled: false,
  isReduceTransparencyEnabled: false,
  isScreenReaderEnabled: false
};

const defaultAccessibility: AccessibilityContextValue = {
  ...defaultSystemAccessibility,
  defaults: {
    highContrastEnabled: false,
    readAloudEnabled: false,
    reduceMotionEnabled: false,
    reduceTransparencyEnabled: false,
    textScaleLevel: 2
  },
  features: {
    boldText: true,
    headerEntry: true,
    highContrast: true,
    readAloud: true,
    reduceMotion: true,
    reduceTransparency: true,
    settingsEntry: true,
    textScaling: true
  },
  isHighContrastEnabled: false,
  isReadAloudEnabled: false,
  preferences: {
    highContrastEnabled: false,
    readAloudEnabled: false,
    reduceMotionEnabled: false,
    reduceTransparencyEnabled: false,
    textScaleLevel: 2
  },
  resetPreferences: () => undefined,
  setPreference: () => undefined,
  setPreferences: () => undefined,
  setTextScaleLevel: () => undefined,
  system: defaultSystemAccessibility,
  textScaleMultiplier: 1
};

export const AccessibilityContext = createContext<AccessibilityContextValue>(defaultAccessibility);

export const AccessibilityProvider = ({ children }: { children?: React.ReactNode }) => {
  const { globalSettings } = useContext(SettingsContext);
  const [systemAccessibility, setSystemAccessibility] = useState<AccessibilitySystemState>(
    defaultSystemAccessibility
  );
  const [preferences, setPreferencesState] = useState(defaultAccessibility.preferences);
  const [hasHydratedSettings, setHasHydratedSettings] = useState(false);
  const [hasStoredPreferences, setHasStoredPreferences] = useState(false);
  const [hasUserInteraction, setHasUserInteraction] = useState(false);

  const { defaults, features } = useMemo(
    () => resolveAccessibilityConfiguration(globalSettings),
    [globalSettings]
  );

  const normalizePreferences = useCallback(
    (
      values: Partial<AccessibilityUserSettings> & {
        boldTextEnabled?: boolean;
        textScaleLevel?: number;
      },
      basePreferences: AccessibilityUserSettings
    ): AccessibilityUserSettings => {
      const nextPreferences: AccessibilityUserSettings = { ...basePreferences };

      (
        Object.keys(ACCESSIBILITY_FEATURE_BY_PREFERENCE) as AccessibilityTogglePreferenceKey[]
      ).forEach((key) => {
        const featureKey = ACCESSIBILITY_FEATURE_BY_PREFERENCE[key];
        if (features[featureKey] === false) return;

        const value = values[key];
        if (typeof value === 'boolean') {
          nextPreferences[key] = value;
        }
      });

      if (features.textScaling) {
        if (typeof values.textScaleLevel === 'number') {
          nextPreferences.textScaleLevel = normalizeTextScaleLevel(values.textScaleLevel);
        } else if (typeof values.boldTextEnabled === 'boolean') {
          nextPreferences.textScaleLevel = normalizeTextScaleLevel(
            defaults.textScaleLevel + (values.boldTextEnabled ? 2 : 0)
          );
        }
      }

      return nextPreferences;
    },
    [defaults.textScaleLevel, features]
  );

  useEffect(() => {
    return accessibilityListeners(setSystemAccessibility);
  }, []);

  useEffect(() => {
    let mounted = true;

    const hydratePreferences = async () => {
      try {
        const storedSettings = await storageHelper.accessibilityUserSettings();

        if (!mounted) return;

        if (storedSettings && typeof storedSettings === 'object') {
          setHasStoredPreferences(true);
          setPreferencesState((prev) =>
            normalizePreferences(
              storedSettings as Partial<AccessibilityUserSettings> & {
                boldTextEnabled?: boolean;
                textScaleLevel?: number;
              },
              prev
            )
          );
        }
      } catch (error) {
        console.warn('Could not load accessibility user settings.', error);
      } finally {
        if (mounted) {
          setHasHydratedSettings(true);
        }
      }
    };

    hydratePreferences();

    return () => {
      mounted = false;
    };
  }, [normalizePreferences]);

  useEffect(() => {
    if (!hasHydratedSettings || hasStoredPreferences || hasUserInteraction) return;

    setPreferencesState((prev) => normalizePreferences(defaults, prev));
  }, [
    defaults,
    hasHydratedSettings,
    hasStoredPreferences,
    hasUserInteraction,
    normalizePreferences
  ]);

  useEffect(() => {
    if (!hasHydratedSettings) return;
    storageHelper.setAccessibilityUserSettings(preferences);
  }, [hasHydratedSettings, preferences]);

  const setPreference = useCallback(
    (key: AccessibilityTogglePreferenceKey, value?: boolean) => {
      const featureKey = ACCESSIBILITY_FEATURE_BY_PREFERENCE[key];

      if (features[featureKey] === false) return;

      setHasUserInteraction(true);
      setPreferencesState((prev) => ({
        ...prev,
        [key]: typeof value === 'boolean' ? value : !prev[key]
      }));
    },
    [features]
  );

  const setPreferences = useCallback(
    (values: Partial<typeof defaultAccessibility.preferences>) => {
      setHasUserInteraction(true);
      setPreferencesState((prev) => normalizePreferences(values, prev));
    },
    [normalizePreferences]
  );

  const setTextScaleLevel = useCallback(
    (level: number) => {
      if (features.textScaling === false) return;
      setHasUserInteraction(true);
      setPreferencesState((prev) => ({
        ...prev,
        textScaleLevel: normalizeTextScaleLevel(level)
      }));
    },
    [features.textScaling]
  );

  const resetPreferences = useCallback(() => {
    setHasUserInteraction(true);
    setPreferencesState(defaults);
  }, [defaults]);

  const accessibility = useMemo<AccessibilityContextValue>(() => {
    const isBoldTextEnabled = systemAccessibility.isBoldTextEnabled;
    const isReduceMotionEnabled =
      systemAccessibility.isReduceMotionEnabled ||
      (features.reduceMotion && preferences.reduceMotionEnabled);
    const isReduceTransparencyEnabled =
      systemAccessibility.isReduceTransparencyEnabled ||
      (features.reduceTransparency && preferences.reduceTransparencyEnabled);
    const textScaleMultiplier = features.textScaling
      ? getTextScaleMultiplier(preferences.textScaleLevel)
      : 1;

    return {
      ...systemAccessibility,
      defaults,
      features,
      isBoldTextEnabled,
      isHighContrastEnabled: features.highContrast && preferences.highContrastEnabled,
      isReadAloudEnabled: features.readAloud && preferences.readAloudEnabled,
      isReduceMotionEnabled,
      isReduceTransparencyEnabled,
      preferences,
      resetPreferences,
      setPreference,
      setPreferences,
      setTextScaleLevel,
      system: systemAccessibility,
      textScaleMultiplier
    };
  }, [
    defaults,
    features,
    preferences,
    resetPreferences,
    setPreference,
    setPreferences,
    setTextScaleLevel,
    systemAccessibility
  ]);

  return (
    <AccessibilityContext.Provider value={accessibility}>{children}</AccessibilityContext.Provider>
  );
};
