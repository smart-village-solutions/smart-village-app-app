/** @jest-environment jsdom */
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
import { configureAxe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    // Component-level tests usually don't include full page landmark structure.
    region: { enabled: false }
  }
});

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const jsonTreeToHtml = (node: any): string => {
  if (node === null || node === undefined) return '';

  if (Array.isArray(node)) {
    return node.map((entry) => jsonTreeToHtml(entry)).join('');
  }

  if (typeof node === 'string' || typeof node === 'number') {
    return escapeHtml(String(node));
  }

  const props = node.props || {};
  const role = props.accessibilityRole;
  const label = props.accessibilityLabel;
  const isDisabled = props.accessibilityState?.disabled;
  const isChecked = props.accessibilityState?.checked;

  let tag = 'div';
  if (role === 'button') tag = 'button';
  if (role === 'link') tag = 'a';
  if (node.type === 'TextInput') tag = 'input';

  const attributes: string[] = [];
  if (tag !== 'button' && tag !== 'a' && role) {
    attributes.push(`role="${escapeHtml(String(role))}"`);
  }
  if (label) {
    attributes.push(`aria-label="${escapeHtml(String(label))}"`);
  }
  if (isDisabled) {
    attributes.push('aria-disabled="true"');
  }
  if (typeof isChecked === 'boolean') {
    attributes.push(`aria-checked="${isChecked}"`);
  }
  if (tag === 'input') {
    attributes.push('type="text"');
  }

  const attributeString = attributes.length > 0 ? ` ${attributes.join(' ')}` : '';
  const children = jsonTreeToHtml(node.children || []);

  if (tag === 'input') {
    return `<input${attributeString} />`;
  }

  return `<${tag}${attributeString}>${children}</${tag}>`;
};

const renderToAxeHtml = (element: React.ReactElement) => {
  const tree = render(element).toJSON();
  return `<main>${jsonTreeToHtml(tree)}</main>`;
};

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
      textInput: '(Texteingabe)',
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
    const html = renderToAxeHtml(<Button onPress={() => {}} title="Speichern" />);
    const results = await axe(html);
    expect(results).toHaveNoViolations();
  });

  it('Button (disabled) has no violations', async () => {
    const html = renderToAxeHtml(<Button disabled onPress={() => {}} title="Löschen" />);
    const results = await axe(html);
    expect(results).toHaveNoViolations();
  });

  it('Touchable has no violations', async () => {
    const html = renderToAxeHtml(
      <Touchable accessibilityLabel="Aktion ausführen" onPress={() => {}}>
        {null}
      </Touchable>
    );
    const results = await axe(html);
    expect(results).toHaveNoViolations();
  });

  it('InputSecureTextIcon (hidden) has no violations', async () => {
    const html = renderToAxeHtml(
      <InputSecureTextIcon isSecureTextEntry setIsSecureTextEntry={() => {}} />
    );
    const results = await axe(html);
    expect(results).toHaveNoViolations();
  });

  it('InputSecureTextIcon (visible) has no violations', async () => {
    const html = renderToAxeHtml(
      <InputSecureTextIcon isSecureTextEntry={false} setIsSecureTextEntry={() => {}} />
    );
    const results = await axe(html);
    expect(results).toHaveNoViolations();
  });
});
