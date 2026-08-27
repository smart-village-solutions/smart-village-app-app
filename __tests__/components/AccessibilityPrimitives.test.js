import React from 'react';
import { Platform, TouchableOpacity } from 'react-native';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  const Button = (props) => ReactLocal.createElement('mock-rne-button', props, props.children);
  const CheckBox = (props) => ReactLocal.createElement('mock-rne-checkbox', props, props.children);
  const Input = (props) => ReactLocal.createElement('mock-rne-input', props, props.children);

  return { Button, CheckBox, Input };
});

jest.mock('react-native-enriched', () => {
  const ReactLocal = require('react');

  return {
    EnrichedTextInput: ReactLocal.forwardRef((props, _ref) =>
      ReactLocal.createElement('mock-enriched-text-input', props)
    )
  };
});

jest.mock('react-hook-form', () => ({
  useController: () => ({
    field: { value: '', onChange: jest.fn(), onBlur: jest.fn() }
  })
}));

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
        formatting: {
          blockquote: 'Zitat',
          bold: 'Fett',
          italic: 'Kursiv',
          lineThrough: 'Durchgestrichen',
          orderedList: 'Nummerierte Liste',
          underline: 'Unterstrichen',
          unorderedList: 'Aufzählungsliste'
        },
        required: '(Pflichtfeld)',
        textInput: '(Texteingabe)'
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
      NamedIcon: (props) => ReactLocal.createElement('mock-named-icon', props),
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
      features: {
        switchLabels: false
      },
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
import { Input } from '../../src/components/form/Input';
import { Radiobutton } from '../../src/components/Radiobutton';
import { Switch as AppSwitch } from '../../src/components/Switch';
import { Touchable } from '../../src/components/Touchable';
import { consts } from '../../src/config';
import { AccessibilityContext } from '../../src/AccessibilityProvider';

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
      <Touchable
        accessibilityLabel="Aktion Taste"
        checked
        disabled
        expanded
        onPress={onPress}
        selected
      />
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

  it('Rich text input exposes field, error and formatting controls to assistive technology', () => {
    const tree = renderWithAct(
      <Input
        control={{}}
        errorMessage="Beschreibung muss ausgefüllt werden"
        label="Beschreibung"
        name="description"
        richText
        rules={{ required: true }}
      />
    );
    const input = tree.root.findByType('mock-enriched-text-input');

    expect(input.props.accessibilityLabel).toBe('Beschreibung (Pflichtfeld) (Texteingabe)');
    expect(input.props.accessibilityState).toEqual({ disabled: false, invalid: true });

    renderer.act(() => {
      input.props.onFocus();
    });

    const toolbarButtons = tree.root.findAllByType(TouchableOpacity);
    expect(toolbarButtons).toHaveLength(7);
    expect(toolbarButtons.map((button) => button.props.accessibilityLabel)).toEqual([
      'Fett (Taste)',
      'Kursiv (Taste)',
      'Unterstrichen (Taste)',
      'Durchgestrichen (Taste)',
      'Aufzählungsliste (Taste)',
      'Nummerierte Liste (Taste)',
      'Zitat (Taste)'
    ]);
    toolbarButtons.forEach((button) => {
      expect(button.props.accessibilityRole).toBe('button');
      expect(button.props.accessibilityState).toEqual({ selected: false });
    });

    const error = tree.root.findByProps({ accessibilityRole: 'alert' });
    expect(error.props.accessibilityLiveRegion).toBe('polite');
  });

  it('Switch exposes switch semantics', () => {
    const tree = renderWithAct(
      <AppSwitch
        accessibilityLabel="Filtereinstellungen dauerhaft speichern"
        isDisabled={true}
        switchValue={false}
        toggleSwitch={onPress}
      />
    );
    const node = tree.root.findByProps({ accessibilityRole: 'switch' });

    expect(node.props.accessibilityState).toEqual({ checked: false, disabled: true });
    expect(node.props.accessibilityLabel).toBe('Filtereinstellungen dauerhaft speichern');
    expect(tree.root.findAllByProps({ testID: 'switch-state-off' })).toHaveLength(0);
  });

  it('Switch displays the on indicator inside the track when app labels are enabled', () => {
    const tree = renderWithAct(
      <AccessibilityContext.Provider
        value={{
          features: { switchLabels: true },
          isReduceMotionEnabled: false,
          isReduceTransparencyEnabled: false,
          isSwitchLabelsEnabled: true
        }}
      >
        <AppSwitch accessibilityLabel="Aktive Option" switchValue toggleSwitch={onPress} />
      </AccessibilityContext.Provider>
    );

    expect(tree.root.findByProps({ testID: 'switch-state-on' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'switch-on-line' })).toBeTruthy();
    expect(tree.root.findAllByType('mock-named-icon')).toHaveLength(0);
  });

  it('Switch displays the off indicator inside the track when app labels are enabled', () => {
    const tree = renderWithAct(
      <AccessibilityContext.Provider
        value={{
          features: { switchLabels: true },
          isReduceMotionEnabled: false,
          isReduceTransparencyEnabled: false,
          isSwitchLabelsEnabled: true
        }}
      >
        <AppSwitch
          accessibilityLabel="Inaktive Option"
          switchValue={false}
          toggleSwitch={onPress}
        />
      </AccessibilityContext.Provider>
    );

    expect(tree.root.findByProps({ testID: 'switch-state-off' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'switch-off-circle' })).toBeTruthy();
  });

  it('Switch displays app-controlled state indicators on Android', () => {
    const originalPlatform = Platform.OS;
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });

    try {
      const tree = renderWithAct(
        <AccessibilityContext.Provider
          value={{
            features: { switchLabels: true },
            isReduceMotionEnabled: false,
            isReduceTransparencyEnabled: false,
            isSwitchLabelsEnabled: true
          }}
        >
          <AppSwitch accessibilityLabel="Aktive Option" switchValue toggleSwitch={onPress} />
        </AccessibilityContext.Provider>
      );

      expect(tree.root.findByProps({ testID: 'switch-state-on' })).toBeTruthy();
      expect(tree.root.findByProps({ testID: 'switch-on-line' })).toBeTruthy();
    } finally {
      Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    }
  });

  it('Switch can always preview the off indicator for the switch-label setting', () => {
    const tree = renderWithAct(
      <AppSwitch
        accessibilityLabel="Ein/Aus-Kennzeichnungen"
        showSwitchLabels
        switchValue={false}
        toggleSwitch={onPress}
      />
    );

    expect(tree.root.findByProps({ testID: 'switch-state-off' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'switch-off-circle' })).toBeTruthy();
  });
});
