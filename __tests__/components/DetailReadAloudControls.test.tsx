/** @jest-environment jsdom */
import React from 'react';
import { Pressable, View } from 'react-native';
import { render } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { configureAxe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

const axe = configureAxe({
  rules: {
    region: { enabled: false }
  }
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#111111',
    gray40: '#cccccc',
    lightestText: '#ffffff',
    placeholder: '#999999',
    primary: '#2288cc',
    surface: '#ffffff'
  },
  normalize: (value: number) => value,
  texts: {
    settingsContents: {
      accessibility: {
        readAloud: {
          currentTextLabel: 'Aktuell gelesen',
          hideReadAlong: 'Mitlese-Text ausblenden',
          pause: 'Vorlesen pausieren',
          progress: 'Abschnitt {{current}} von {{total}}',
          resume: 'Vorlesen fortsetzen',
          showReadAlong: 'Mitlese-Text anzeigen',
          speedFast: '1.2x',
          speedNormal: '1.0x',
          speedSlow: '0.8x',
          speedTitle: 'Vorlesegeschwindigkeit',
          start: 'Vorlesen starten',
          stop: 'Vorlesen stoppen',
          title: 'Lesemodus in Details'
        }
      }
    }
  }
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const React = require('react');
  return {
    AccessibilityContext: React.createContext({
      isHighContrastEnabled: false
    })
  };
});

jest.mock('../../src/components/Button', () => {
  const React = require('react');
  const { Pressable, Text } = require('react-native');

  return {
    Button: ({ disabled, onPress, title }) => (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={title}
        accessibilityState={{ disabled: !!disabled }}
        disabled={disabled}
        onPress={onPress}
      >
        <Text>{title}</Text>
      </Pressable>
    )
  };
});

jest.mock('../../src/components/Text', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    RegularText: ({ children, ...props }) => <Text {...props}>{children}</Text>
  };
});

jest.mock('../../src/components/Wrapper', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    WrapperHorizontal: ({ children }) => <View>{children}</View>,
    WrapperRow: ({ children, style }) => <View style={style}>{children}</View>,
    WrapperVertical: ({ children }) => <View>{children}</View>
  };
});

import { AccessibilityContext } from '../../src/AccessibilityProvider';
import { DetailReadAloudControls } from '../../src/components/detail/DetailReadAloudControls';

type RenderOptions = {
  highContrastEnabled?: boolean;
};

const defaultProps = {
  activeItemId: 'content-1',
  activeWordRange: { length: 4, start: 0 },
  canStart: true,
  currentItemIndex: 0,
  currentItemText: 'Aktueller Abschnitt',
  isPaused: false,
  isSpeaking: false,
  onPause: jest.fn(),
  onResume: jest.fn(),
  onSpeechRateChange: jest.fn(),
  onStart: jest.fn(),
  onStop: jest.fn(),
  speechRate: 1,
  totalItems: 3
};

const wrapWithContext = (element: React.ReactElement, options: RenderOptions = {}) => (
  <AccessibilityContext.Provider
    value={{
      defaults: {
        boldTextEnabled: false,
        isGrayscaleEnabled: false,
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
        isGrayscaleEnabled: true,
        readAloud: true,
        reduceMotion: true,
        reduceTransparency: true,
        settingsEntry: true,
        textScaling: true
      },
      isBoldTextEnabled: false,
      isGrayscaleEnabled: false,
      isHighContrastEnabled: !!options.highContrastEnabled,
      isInvertColorsEnabled: false,
      isReadAloudEnabled: false,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      isScreenReaderEnabled: false,
      preferences: {
        boldTextEnabled: false,
        isGrayscaleEnabled: false,
        highContrastEnabled: false,
        readAloudEnabled: false,
        reduceMotionEnabled: false,
        reduceTransparencyEnabled: false,
        textScaleLevel: 2
      },
      resetPreferences: jest.fn(),
      setPreference: jest.fn(),
      setPreferences: jest.fn(),
      setTextScaleLevel: jest.fn(),
      system: {
        isBoldTextEnabled: false,
        isGrayscaleEnabled: false,
        isInvertColorsEnabled: false,
        isReduceMotionEnabled: false,
        isReduceTransparencyEnabled: false,
        isScreenReaderEnabled: false
      },
      textScaleMultiplier: 1
    }}
  >
    {element}
  </AccessibilityContext.Provider>
);

const renderToAxeHtml = (tree: any): string => {
  const toHtml = (node: any): string => {
    if (node === null || node === undefined) return '';
    if (Array.isArray(node)) return node.map((child) => toHtml(child)).join('');
    if (typeof node === 'string' || typeof node === 'number') return String(node);

    const props = node.props || {};
    const role = props.accessibilityRole;
    const label = props.accessibilityLabel;
    const accessibilityState = props.accessibilityState || {};

    const tag = role === 'button' ? 'button' : 'div';
    const attrs = [];
    if (label) attrs.push(`aria-label="${String(label)}"`);
    if (typeof accessibilityState.selected === 'boolean') {
      attrs.push(`aria-pressed="${String(accessibilityState.selected)}"`);
    }
    if (typeof accessibilityState.expanded === 'boolean') {
      attrs.push(`aria-expanded="${String(accessibilityState.expanded)}"`);
    }
    if (typeof accessibilityState.disabled === 'boolean') {
      attrs.push(`aria-disabled="${String(accessibilityState.disabled)}"`);
    }

    const attrString = attrs.length ? ` ${attrs.join(' ')}` : '';
    const children = toHtml(node.children || []);
    return `<${tag}${attrString}>${children}</${tag}>`;
  };

  return `<main>${toHtml(tree)}</main>`;
};

describe('DetailReadAloudControls', () => {
  const createTestTree = (props = defaultProps) => {
    let tree;

    renderer.act(() => {
      tree = renderer.create(wrapWithContext(<DetailReadAloudControls {...props} />));
    });

    return tree;
  };

  const getInteractiveNodes = (tree) =>
    tree.root.findAll((node) => node.props?.accessibilityRole === 'button');

  const getUniqueSpeedOptions = (tree) => {
    const speedNodes = getInteractiveNodes(tree).filter(
      (node) =>
        typeof node.props?.accessibilityState?.selected === 'boolean' &&
        typeof node.props?.onPress === 'function'
    );

    return Array.from(new Map(speedNodes.map((node) => [node.props.onPress, node])).values());
  };

  it('renders snapshot with default state', () => {
    const tree = createTestTree().toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('exposes expanded state on read-along toggle', () => {
    const tree = createTestTree();
    const toggle = getInteractiveNodes(tree).find(
      (node) => typeof node.props?.accessibilityState?.expanded === 'boolean'
    );

    expect(toggle).toBeDefined();
    expect(toggle.props.accessibilityState.expanded).toBe(false);

    renderer.act(() => {
      toggle.props.onPress();
    });

    const updatedToggle = getInteractiveNodes(tree).find(
      (node) => typeof node.props?.accessibilityState?.expanded === 'boolean'
    );
    expect(updatedToggle).toBeDefined();
    expect(updatedToggle.props.accessibilityState.expanded).toBe(true);
  });

  it('exposes selected state for speech speed chips', () => {
    const tree = createTestTree({ ...defaultProps, speechRate: 1.2 });
    const speedOptions = getUniqueSpeedOptions(tree);
    const selectedStates = speedOptions.map((node) => node.props.accessibilityState.selected);

    expect(speedOptions).toHaveLength(3);
    expect(selectedStates.filter(Boolean)).toHaveLength(1);
    expect(selectedStates.filter((value) => value === false)).toHaveLength(2);
  });

  it('has no axe accessibility violations for control states', async () => {
    const tree = render(wrapWithContext(<DetailReadAloudControls {...defaultProps} />)).toJSON();
    const html = renderToAxeHtml(tree);
    const results = await axe(html);

    expect(results).toHaveNoViolations();
  });
});
