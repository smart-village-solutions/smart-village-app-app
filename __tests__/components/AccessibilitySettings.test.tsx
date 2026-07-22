import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  const ListItem = (props: unknown) =>
    ReactLocal.createElement('mock-list-item', props, props.children);
  ListItem.Content = (props: unknown) =>
    ReactLocal.createElement('mock-list-item-content', props, props.children);

  return {
    ListItem,
    Slider: (props: unknown) => ReactLocal.createElement('mock-slider', props)
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#141414',
    gray40: '#DBDBE6',
    primary: '#C44D36',
    transparent: 'transparent'
  },
  consts: {
    a11yLabel: {
      button: '(Taste)'
    }
  },
  normalize: (value: number) => value,
  texts: {
    accessibilityLabels: {
      actions: {
        decreaseTextSize: 'Schriftgröße verkleinern',
        increaseTextSize: 'Schriftgröße vergrößern'
      }
    },
    settingsContents: {
      accessibility: {
        boldText: { title: 'Fetter Text', description: 'desc' },
        highContrast: { title: 'Hoher Kontrast', description: 'desc' },
        isGrayscaleEnabled: { title: 'Graustufen', description: 'desc' },
        readAloud: { title: 'Vorlesen', description: 'desc' },
        reduceMotion: { title: 'Bewegung reduzieren', description: 'desc' },
        reduceTransparency: { title: 'Transparenz reduzieren', description: 'desc' },
        reset: 'Auf Standardwerte zurücksetzen',
        theme: {
          title: 'Farbschema',
          description: 'Farbschema auswählen',
          light: 'Hell',
          dark: 'Dunkel',
          system: 'Systemeinstellung'
        },
        textSize: {
          currentValue: 'Aktuelle Größe: {{value}}',
          decreaseLabel: 'A-',
          description: 'Passe die Schriftgröße in der App stufenweise an.',
          increaseLabel: 'A+',
          levelDefault: 'Standard',
          levelLarge: 'Groß',
          levelLarger: 'Größer',
          levelLargest: 'Am größten',
          levelMaximum: 'Maximum',
          levelSmall: 'Klein',
          levelSmallest: 'Am kleinsten',
          sliderLabel: 'Schriftgröße',
          title: 'Textgröße'
        }
      }
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  ACCESSIBILITY_TEXT_SCALE_MULTIPLIERS: [0.85, 0.925, 1, 1.125, 1.25, 1.375, 1.5],
  normalizeTextScaleLevel: (value: number) => value
}));

const mockUseAccessibilityPreferences = jest.fn();

jest.mock('../../src/hooks', () => ({
  useAccessibilityPreferences: () => mockUseAccessibilityPreferences()
}));

jest.mock('../../src/components/Button', () => ({
  Button: () => null
}));

jest.mock('../../src/components/SettingsToggle', () => ({
  SettingsToggle: () => null
}));

jest.mock('../../src/components/Radiobutton', () => ({
  Radiobutton: (props: unknown) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-radiobutton', props);
  }
}));

jest.mock('../../src/components/Text', () => ({
  BoldText: ({ children }) => children,
  RegularText: ({ children }) => children
}));

jest.mock('../../src/components/Touchable', () => ({
  Touchable: ({ children, ...props }) => {
    const ReactLocal = require('react');

    return ReactLocal.createElement('mock-touchable', props, children);
  }
}));

jest.mock('../../src/components/Wrapper', () => ({
  WrapperHorizontal: ({ children }) => children,
  WrapperVertical: ({ children }) => children
}));

import { AccessibilitySettings } from '../../src/components/settings/AccessibilitySettings';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('AccessibilitySettings', () => {
  beforeEach(() => {
    mockUseAccessibilityPreferences.mockReturnValue({
      features: {
        textScaling: true
      },
      preferences: {
        textScaleLevel: 2
      },
      resetPreferences: jest.fn(),
      setPreference: jest.fn(),
      setTextScaleLevel: jest.fn(),
      setThemeMode: jest.fn(),
      themeMode: 'system'
    });
  });

  it('uses dark borders for text size buttons in high contrast mode', () => {
    mockUseAccessibilityPreferences.mockReturnValue({
      features: {
        highContrast: true,
        textScaling: true
      },
      isHighContrastEnabled: true,
      preferences: {
        textScaleLevel: 2
      },
      resetPreferences: jest.fn(),
      setPreference: jest.fn(),
      setTextScaleLevel: jest.fn(),
      setThemeMode: jest.fn(),
      themeMode: 'system'
    });

    const tree = renderWithAct(
      <AccessibilitySettings withResetButton={false} withScrollView={false} />
    );
    const touchables = tree.root.findAllByType('mock-touchable');

    expect(touchables[0].props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: '#141414' })])
    );
    expect(touchables[1].props.style).toEqual(
      expect.arrayContaining([expect.objectContaining({ borderColor: '#141414' })])
    );
  });

  it('renders an accessible light, dark and system radio group when theming is enabled', () => {
    const setThemeMode = jest.fn();
    mockUseAccessibilityPreferences.mockReturnValue({
      features: {
        textScaling: false,
        theming: true
      },
      preferences: {
        textScaleLevel: 2
      },
      resetPreferences: jest.fn(),
      setPreference: jest.fn(),
      setTextScaleLevel: jest.fn(),
      setThemeMode,
      themeMode: 'system'
    });

    const tree = renderWithAct(
      <AccessibilitySettings withResetButton={false} withScrollView={false} />
    );
    const radioGroup = tree.root.findByProps({ accessibilityRole: 'radiogroup' });
    const radios = tree.root.findAllByType('mock-radiobutton');

    expect(radioGroup.props.accessibilityLabel).toBe('Farbschema');
    expect(radios.map((radio) => radio.props.title)).toEqual([
      'Hell',
      'Dunkel',
      'Systemeinstellung'
    ]);
    expect(radios.map((radio) => radio.props.selected)).toEqual([false, false, true]);

    renderer.act(() => {
      radios[1].props.onPress();
    });

    expect(setThemeMode).toHaveBeenCalledWith('dark');
  });
});
