import {
  ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS,
  DEFAULT_ACCESSIBILITY_FEATURES,
  DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL,
  DEFAULT_ACCESSIBILITY_USER_SETTINGS,
  getAccessibilityHeaderEntryEnabled,
  getAccessibilitySettingsEntryEnabled,
  isAccessibilityFeatureEnabled,
  normalizeTextScaleLevel,
  resolveAccessibilityConfiguration
} from '../../src/helpers/accessibilitySettingsHelper';

describe('accessibilitySettingsHelper', () => {
  it('returns helper defaults when accessibility config is missing', () => {
    const resolved = resolveAccessibilityConfiguration();

    expect(resolved.features).toEqual(DEFAULT_ACCESSIBILITY_FEATURES);
    expect(resolved.defaults).toEqual(DEFAULT_ACCESSIBILITY_USER_SETTINGS);
  });

  it('applies only boolean enabledFeatures values', () => {
    const resolved = resolveAccessibilityConfiguration({
      settings: {
        accessibility: {
          enabledFeatures: {
            settingsEntry: true,
            headerEntry: true,
            textScaling: true,
            boldText: true,
            highContrast: false,
            // invalid values should fall back to defaults
            reduceMotion: 'yes' as unknown as boolean,
            readAloud: 1 as unknown as boolean
          }
        }
      }
    });

    expect(resolved.features.settingsEntry).toBe(true);
    expect(resolved.features.headerEntry).toBe(true);
    expect(resolved.features.textScaling).toBe(true);
    expect(resolved.features.boldText).toBe(true);
    expect(resolved.features.highContrast).toBe(false);
    expect(resolved.features.reduceMotion).toBe(DEFAULT_ACCESSIBILITY_FEATURES.reduceMotion);
    expect(resolved.features.readAloud).toBe(DEFAULT_ACCESSIBILITY_FEATURES.readAloud);
  });

  it('normalizes text scale levels to valid bounds', () => {
    const maxLevel = ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS.length - 1;

    expect(normalizeTextScaleLevel(DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL)).toBe(
      DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL
    );
    expect(normalizeTextScaleLevel(-10)).toBe(0);
    expect(normalizeTextScaleLevel(999)).toBe(maxLevel);
    expect(normalizeTextScaleLevel(1.6)).toBe(2);
    expect(normalizeTextScaleLevel(Number.NaN)).toBe(DEFAULT_ACCESSIBILITY_TEXT_SCALE_LEVEL);
  });

  it('supports legacy defaults keys (boldText / textScaling)', () => {
    const resolved = resolveAccessibilityConfiguration({
      settings: {
        accessibility: {
          defaults: {
            boldText: true,
            textScaling: 6.8
          }
        }
      }
    });

    expect(resolved.defaults.boldTextEnabled).toBe(true);
    expect(resolved.defaults.textScaleLevel).toBe(ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS.length - 1);
  });

  it('reads modern defaults from global settings', () => {
    const resolved = resolveAccessibilityConfiguration({
      settings: {
        accessibility: {
          defaults: {
            isGrayscaleEnabled: true,
            highContrastEnabled: true,
            readAloudEnabled: true,
            reduceMotionEnabled: true,
            reduceTransparencyEnabled: true,
            textScaleLevel: 0
          }
        }
      }
    });

    expect(resolved.defaults.isGrayscaleEnabled).toBe(true);
    expect(resolved.defaults.highContrastEnabled).toBe(true);
    expect(resolved.defaults.readAloudEnabled).toBe(true);
    expect(resolved.defaults.reduceMotionEnabled).toBe(true);
    expect(resolved.defaults.reduceTransparencyEnabled).toBe(true);
    expect(resolved.defaults.textScaleLevel).toBe(0);
  });

  it('exposes feature helper selectors', () => {
    const settings = {
      settings: {
        accessibility: {
          enabledFeatures: {
            settingsEntry: true,
            headerEntry: false,
            readAloud: true
          }
        }
      }
    };

    expect(getAccessibilitySettingsEntryEnabled(settings)).toBe(true);
    expect(getAccessibilityHeaderEntryEnabled(settings)).toBe(false);
    expect(isAccessibilityFeatureEnabled(settings, 'readAloud')).toBe(true);
    expect(isAccessibilityFeatureEnabled(settings, 'highContrast')).toBe(false);
  });
});
