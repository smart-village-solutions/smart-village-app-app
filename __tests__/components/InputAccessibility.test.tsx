import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native-elements', () => {
  const ReactLocal = require('react');

  return {
    Input: (props) => ReactLocal.createElement('TextInput', props)
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    darkText: '#141414',
    error: '#ae001d',
    gray20: '#eaeaea',
    gray40: '#dbdbe6',
    gray60: '#bcbbc1',
    overlayRgba: 'rgba(20,20,20,0.7)',
    placeholder: '#a2a2a2',
    primary: '#107821'
  },
  consts: {
    a11yLabel: {
      email: 'E-Mail-Adresse',
      required: '(Pflichtfeld)',
      textInput: '(Texteingabe)'
    }
  },
  device: {
    platform: 'ios'
  },
  Icon: {
    AlertHexagonFilled: () => null,
    Ok: () => null
  },
  normalize: (value: number) => value
}));

jest.mock('../../src/AccessibilityProvider', () => {
  const ReactLocal = require('react');

  return {
    AccessibilityContext: ReactLocal.createContext({
      isReduceTransparencyEnabled: false
    })
  };
});

jest.mock('react-hook-form', () => ({
  useController: () => ({
    field: {
      onBlur: jest.fn(),
      onChange: jest.fn(),
      value: ''
    }
  })
}));

jest.mock('../../src/components/Label', () => ({
  Label: ({ children }) => children
}));

import { Input } from '../../src/components/form/Input';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('Input accessibility', () => {
  it('uses the visible label as accessibility label fallback', () => {
    const tree = renderWithAct(
      <Input control={{} as never} label="Name" name="name" placeholder="Name" />
    );

    const inputNode = tree.root.findByType('TextInput');

    expect(inputNode.props.accessibilityLabel).toBe('Name (Texteingabe)');
  });

  it('replaces the required marker with an explicit required-field announcement', () => {
    const tree = renderWithAct(
      <Input
        control={{} as never}
        label="Ihr Feedback zur MagdeApp *"
        name="message"
        placeholder="Ihr Feedback zur MagdeApp"
        rules={{ required: 'Bitte ausfüllen' }}
      />
    );

    const inputNode = tree.root.findByType('TextInput');

    expect(inputNode.props.accessibilityLabel).toBe(
      'Ihr Feedback zur MagdeApp (Pflichtfeld) (Texteingabe)'
    );
  });
});
