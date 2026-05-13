import React from 'react';
import { TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  const Button = (props) => ReactLocal.createElement('mock-rne-button', props, props.children);
  const CheckBox = (props) => ReactLocal.createElement('mock-rne-checkbox', props, props.children);

  return { Button, CheckBox };
});

jest.mock('../../src/config', () => {
  const ReactLocal = require('react');

  const MockIcon = () => ReactLocal.createElement('mock-icon');

  return {
    colors: {
      darkText: '#141414',
      error: '#ae001d',
      gray20: '#eaeaea',
      gray40: '#dbdbe6',
      gray60: '#bcbbc1',
      lightestText: '#ffffff',
      overlayRgba: 'rgba(20,20,20,0.7)',
      placeholder: '#a2a2a2',
      primary: '#107821',
      refreshControl: '#107821',
      shadow: '#bcbcc1',
      surface: '#ffffff',
      transparent: 'transparent'
    },
    consts: {
      a11yLabel: {
        button: '(Taste)',
        checkbox: '(Checkbox)',
        textInput: 'Texteingabe'
      },
      DIMENSIONS: {
        FULL_SCREEN_MAX_WIDTH: 504
      }
    },
    device: {
      isTablet: false,
      platform: 'ios'
    },
    Icon: {
      AlertHexagonFilled: MockIcon,
      Ok: MockIcon,
      RadioButtonEmpty: MockIcon,
      RadioButtonFilled: MockIcon
    },
    normalize: (value) => value,
    texts: {
      accessibilityLabels: {
        checkbox: {
          active: 'ausgewählt',
          inactive: 'nicht ausgewählt'
        }
      }
    }
  };
});

jest.mock('../../src/hooks', () => ({
  useOpenWebScreen: () => jest.fn()
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isBoldTextEnabled: false,
      isGrayscaleEnabled: false,
      isInvertColorsEnabled: false,
      isReduceMotionEnabled: false,
      isReduceTransparencyEnabled: false,
      isScreenReaderEnabled: false
    }),
    AccessibilityProvider: ({ children }) => children
  };
});

import { Button } from '../../src/components/Button';
import { Checkbox } from '../../src/components/Checkbox';
import { Radiobutton } from '../../src/components/Radiobutton';
import { Switch as AppSwitch } from '../../src/components/Switch';
import { Touchable } from '../../src/components/Touchable';
import { consts } from '../../src/config';

describe('Accessibility primitives', () => {
  const onPress = () => {};
  const renderWithAct = (component) => {
    let testRenderer;

    renderer.act(() => {
      testRenderer = renderer.create(component);
    });

    return testRenderer;
  };

  it('Button provides role and disabled state', () => {
    const tree = renderWithAct(<Button disabled onPress={onPress} title="Speichern" />);
    const node = tree.root.findByType('mock-rne-button');

    expect(node.props.accessibilityRole).toBe('button');
    expect(node.props.accessibilityState).toEqual({ disabled: true });
    expect(node.props.accessibilityLabel).toBe(`Speichern ${consts.a11yLabel.button}`);
  });

  it('Touchable sets default role and merges state', () => {
    const tree = renderWithAct(
      <Touchable accessibilityLabel="Aktion Taste" checked disabled expanded onPress={onPress} selected />
    );
    const node = tree.root.findByType(TouchableOpacity);

    expect(node.props.accessibilityRole).toBe('button');
    expect(node.props.accessibilityState).toEqual({
      checked: true,
      disabled: true,
      expanded: true,
      selected: true
    });
  });

  it('Checkbox exposes checkbox semantics', () => {
    const tree = renderWithAct(
      <Checkbox checked disabled onPress={onPress} title="Datenschutz akzeptieren" />
    );
    const node = tree.root.findByType('mock-rne-checkbox');

    expect(node.props.accessibilityState).toEqual({ checked: true, disabled: true });
    expect(node.props.accessibilityRole).toBe('checkbox');
  });

  it('Radiobutton exposes radio semantics', () => {
    const tree = renderWithAct(
      <Radiobutton disabled onPress={onPress} selected title="Option A" />
    );
    const node = tree.root.findByType('mock-rne-checkbox');

    expect(node.props.accessibilityState).toEqual({ checked: true, disabled: true });
    expect(node.props.accessibilityRole).toBe('radio');
  });

  it('Switch exposes switch semantics', () => {
    const tree = renderWithAct(
      <AppSwitch isDisabled={true} switchValue={false} toggleSwitch={onPress} />
    );
    const node = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(node.props.accessibilityState).toEqual({ checked: false, disabled: true });
  });
});
