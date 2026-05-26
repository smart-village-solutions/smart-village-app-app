/**
 * Automated accessibility violation tests using jest-axe.
 *
 * These tests render key interactive components and assert that
 * axe-core reports no violations. Add new components here as they
 * gain accessibility support.
 *
 * Run: yarn test:accessibility:axe
 */
import React from 'react';
import { render } from '@testing-library/react-native';
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

// ---------------------------------------------------------------------------
// Mocks required to isolate components from native modules
// ---------------------------------------------------------------------------
jest.mock('react-native-elements', () => {
  const React = require('react');
  return {
    Button: (props: any) =>
      React.createElement('View', {
        accessibilityRole: props.accessibilityRole,
        accessibilityLabel: props.accessibilityLabel,
        accessibilityState: props.accessibilityState,
        accessibilityHint: props.accessibilityHint
      }),
    CheckBox: (props: any) =>
      React.createElement('View', {
        accessibilityRole: props.accessibilityRole,
        accessibilityState: props.accessibilityState
      }),
    Input: (props: any) =>
      React.createElement('TextInput', {
        accessibilityLabel: props.accessibilityLabel,
        accessibilityState: props.accessibilityState,
        ...props
      })
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#141414',
    error: '#ae001d',
    primary: '#107821',
    refreshControl: '#107821',
    surface: '#fff',
    overlayRgba: 'rgba(0,0,0,0.5)',
    gray40: '#dbdbe6',
    placeholder: '#a2a2a2',
    transparent: 'transparent'
  },
  consts: {
    a11yLabel: {
      button: '(Taste)',
      checkbox: '(Checkbox)',
      textInput: 'Texteingabe',
      loading: 'Wird geladen',
      loadingModal: 'Ladevorgang'
    },
    DIMENSIONS: { FULL_SCREEN_MAX_WIDTH: 504 }
  },
  device: { isTablet: false, platform: 'ios' },
  Icon: {
    AlertHexagonFilled: () => null,
    Ok: () => null,
    Visible: () => null,
    Unvisible: () => null
  },
  normalize: (v: number) => v,
  texts: {
    accessibilityLabels: {
      secureInputIcons: { visible: 'Passwort anzeigen', invisible: 'Passwort verbergen' }
    }
  }
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const React = require('react');
  return {
    AccessibilityContext: React.createContext({
      isBoldTextEnabled: false,
      isGrayscaleEnabled: false,
      isInvertColorsEnabled: false,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      isScreenReaderEnabled: false
    }),
    AccessibilityProvider: ({ children }: any) => children
  };
});

jest.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: '', onChange: jest.fn(), onBlur: jest.fn() },
    fieldState: { error: undefined }
  })
}));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
import { Button } from '../../src/components/Button';
import { Touchable } from '../../src/components/Touchable';
import { InputSecureTextIcon } from '../../src/components/form/InputSecureTextIcon';

describe('Accessibility violations (axe)', () => {
  it('Button has no violations', async () => {
    const { container } = render(<Button onPress={() => {}} title="Speichern" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Button (disabled) has no violations', async () => {
    const { container } = render(<Button disabled onPress={() => {}} title="Löschen" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('Touchable has no violations', async () => {
    const { container } = render(
      <Touchable accessibilityLabel="Aktion ausführen" onPress={() => {}}>
        {null}
      </Touchable>
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('InputSecureTextIcon (hidden) has no violations', async () => {
    const { container } = render(
      <InputSecureTextIcon isSecureTextEntry setIsSecureTextEntry={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('InputSecureTextIcon (visible) has no violations', async () => {
    const { container } = render(
      <InputSecureTextIcon isSecureTextEntry={false} setIsSecureTextEntry={() => {}} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
