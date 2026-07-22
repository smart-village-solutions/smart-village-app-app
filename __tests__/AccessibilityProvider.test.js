import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useContext, useEffect } from 'react';
import renderer from 'react-test-renderer';

const mockUseColorScheme = jest.fn();

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockUseColorScheme()
}));

jest.mock('../src/helpers/accessibilityListeners', () => ({
  accessibilityListeners: () => () => undefined
}));

import { AccessibilityContext, AccessibilityProvider } from '../src/AccessibilityProvider';
import { lightColors } from '../src/config';
import { SettingsContext } from '../src/SettingsProvider';

let currentAccessibility;

const ContextReader = () => {
  const accessibility = useContext(AccessibilityContext);

  useEffect(() => {
    currentAccessibility = accessibility;
  }, [accessibility]);

  return null;
};

const renderProvider = async (globalSettings) => {
  let tree;

  await renderer.act(async () => {
    tree = renderer.create(
      <SettingsContext.Provider value={{ globalSettings }}>
        <AccessibilityProvider>
          <ContextReader />
        </AccessibilityProvider>
      </SettingsContext.Provider>
    );
  });

  return tree;
};

describe('AccessibilityProvider theming', () => {
  beforeEach(async () => {
    currentAccessibility = undefined;
    mockUseColorScheme.mockReturnValue('light');
    await AsyncStorage.clear();
  });

  it('resolves system mode and configured palette overrides after hydration', async () => {
    mockUseColorScheme.mockReturnValue('dark');

    await renderProvider({
      settings: {
        accessibility: {
          defaults: { themeMode: 'system' },
          enabledFeatures: { theming: true },
          themePalettes: {
            dark: { border: '#67676F' }
          }
        }
      }
    });

    expect(currentAccessibility.isHydrated).toBe(true);
    expect(currentAccessibility.themeMode).toBe('system');
    expect(currentAccessibility.resolvedThemeMode).toBe('dark');
    expect(currentAccessibility.themeColors.border).toBe('#67676F');
  });

  it('migrates legacy stored preferences with the configured theme default and persists changes', async () => {
    await AsyncStorage.setItem(
      'accessibilityUserSettings',
      JSON.stringify({ boldTextEnabled: true, textScaleLevel: 3 })
    );

    await renderProvider({
      settings: {
        accessibility: {
          defaults: { themeMode: 'dark' },
          enabledFeatures: { boldText: true, textScaling: true, theming: true }
        }
      }
    });

    expect(currentAccessibility.preferences.boldTextEnabled).toBe(true);
    expect(currentAccessibility.preferences.textScaleLevel).toBe(3);
    expect(currentAccessibility.themeMode).toBe('dark');

    await renderer.act(async () => {
      currentAccessibility.setThemeMode('light');
    });

    const storedSettings = JSON.parse(await AsyncStorage.getItem('accessibilityUserSettings'));
    expect(storedSettings.themeMode).toBe('light');
  });

  it('forces the built-in light palette while theming is disabled', async () => {
    await renderProvider({
      settings: {
        accessibility: {
          defaults: { themeMode: 'dark' },
          enabledFeatures: { theming: false },
          themePalettes: {
            light: { border: '#C5C5CC' }
          }
        }
      }
    });

    expect(currentAccessibility.resolvedThemeMode).toBe('light');
    expect(currentAccessibility.themeColors).toBe(lightColors);

    renderer.act(() => {
      currentAccessibility.setThemeMode('dark');
    });

    expect(currentAccessibility.themeMode).toBe('system');
  });
});
