import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';

import { isThemeMode, lightColors, resolveThemeMode } from './config/colors';
import {
  ACCESSIBILITY_FEATURE_BY_PREFERENCE,
  getTextScaleMultiplier,
  normalizeTextScaleLevel,
  resolveAccessibilityConfiguration
} from './helpers/accessibilitySettingsHelper';
import { accessibilityListeners } from './helpers/accessibilityListeners';
import { storageHelper } from './helpers/storageHelper';
import { resolveThemePalettes } from './helpers/themeHelper';
import { SettingsContext } from './SettingsProvider';
import {
  AccessibilityContextValue,
  AccessibilitySystemState,
  AccessibilityTogglePreferenceKey,
  AccessibilityUserSettings
} from './types/Accessibility';
import { ThemeMode } from './types/Theme';

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
    boldTextEnabled: false,
    isGrayscaleEnabled: false,
    highContrastEnabled: false,
    readAloudEnabled: false,
    reduceMotionEnabled: false,
    reduceTransparencyEnabled: false,
    textScaleLevel: 2,
    themeMode: 'system'
  },
  features: {
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
  },
  isHighContrastEnabled: false,
  isHydrated: false,
  isReadAloudEnabled: false,
  preferences: {
    boldTextEnabled: false,
    isGrayscaleEnabled: false,
    highContrastEnabled: false,
    readAloudEnabled: false,
    reduceMotionEnabled: false,
    reduceTransparencyEnabled: false,
    textScaleLevel: 2,
    themeMode: 'system'
  },
  resolvedThemeMode: 'light',
  resetPreferences: () => undefined,
  setPreference: () => undefined,
  setPreferences: () => undefined,
  setTextScaleLevel: () => undefined,
  setThemeMode: () => undefined,
  system: defaultSystemAccessibility,
  themeColors: lightColors,
  themeMode: 'system',
  textScaleMultiplier: 1
};

export const AccessibilityContext = createContext<AccessibilityContextValue>(defaultAccessibility);

export const AccessibilityProvider = ({ children }: { children?: React.ReactNode }) => {
  const { globalSettings } = useContext(SettingsContext);
  const systemColorScheme = useColorScheme();
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
      values: Partial<AccessibilityUserSettings>,
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
        }
      }

      if (features.theming && isThemeMode(values.themeMode)) {
        nextPreferences.themeMode = values.themeMode;
      }

      return nextPreferences;
    },
    [features]
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
          setPreferencesState(
            normalizePreferences(storedSettings as Partial<AccessibilityUserSettings>, defaults)
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
  }, [defaults, normalizePreferences]);

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

  const setThemeMode = useCallback(
    (mode: ThemeMode) => {
      if (features.theming === false || !isThemeMode(mode)) return;
      setHasUserInteraction(true);
      setPreferencesState((prev) => ({ ...prev, themeMode: mode }));
    },
    [features.theming]
  );

  const resetPreferences = useCallback(() => {
    setHasUserInteraction(true);
    setPreferencesState(defaults);
  }, [defaults]);

  const resolvedThemeMode = features.theming
    ? resolveThemeMode(preferences.themeMode, systemColorScheme)
    : 'light';
  const configuredThemePalettes = useMemo(
    () => resolveThemePalettes(globalSettings),
    [globalSettings]
  );
  const themeColors = features.theming ? configuredThemePalettes[resolvedThemeMode] : lightColors;
  const textScaleMultiplier = features.textScaling
    ? getTextScaleMultiplier(preferences.textScaleLevel)
    : 1;

  const accessibility = useMemo<AccessibilityContextValue>(() => {
    const isBoldTextEnabled =
      systemAccessibility.isBoldTextEnabled || (features.boldText && preferences.boldTextEnabled);
    const isGrayscaleEnabled =
      systemAccessibility.isGrayscaleEnabled ||
      (features.isGrayscaleEnabled && preferences.isGrayscaleEnabled);
    const isReduceMotionEnabled =
      systemAccessibility.isReduceMotionEnabled ||
      (features.reduceMotion && preferences.reduceMotionEnabled);
    const isReduceTransparencyEnabled =
      systemAccessibility.isReduceTransparencyEnabled ||
      (features.reduceTransparency && preferences.reduceTransparencyEnabled);
    return {
      ...systemAccessibility,
      defaults,
      features,
      isBoldTextEnabled,
      isGrayscaleEnabled,
      isHighContrastEnabled: features.highContrast && preferences.highContrastEnabled,
      isHydrated: hasHydratedSettings,
      isReadAloudEnabled: features.readAloud && preferences.readAloudEnabled,
      isReduceMotionEnabled,
      isReduceTransparencyEnabled,
      preferences,
      resolvedThemeMode,
      resetPreferences,
      setPreference,
      setPreferences,
      setTextScaleLevel,
      setThemeMode,
      system: systemAccessibility,
      themeColors,
      themeMode: preferences.themeMode,
      textScaleMultiplier
    };
  }, [
    defaults,
    features,
    hasHydratedSettings,
    preferences,
    resetPreferences,
    setPreference,
    setPreferences,
    setTextScaleLevel,
    setThemeMode,
    systemAccessibility,
    resolvedThemeMode,
    themeColors,
    textScaleMultiplier
  ]);

  return (
    <AccessibilityContext.Provider value={accessibility}>{children}</AccessibilityContext.Provider>
  );
};
