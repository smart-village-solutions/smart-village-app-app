import React from 'react';
import renderer from 'react-test-renderer';

jest.mock('react-native', () => {
  const ReactLocal = require('react');

  return {
    Alert: {
      alert: jest.fn()
    },
    Keyboard: {
      dismiss: jest.fn()
    },
    ScrollView: ({ children, ...props }) => ReactLocal.createElement('mock-scroll-view', props, children),
    StyleSheet: {
      create: (styles) => styles
    }
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
    navigate: jest.fn()
  })
}));

jest.mock('react-apollo', () => ({
  useMutation: () => [jest.fn(async () => undefined)]
}));

jest.mock('react-hook-form', () => ({
  Controller: ({ render }) => render({ field: { onChange: jest.fn(), value: false } }),
  useForm: () => ({
    control: {},
    formState: { errors: {} },
    handleSubmit: (handler) => handler
  })
}));

jest.mock('../../src/components', () => {
  const ReactLocal = require('react');

  return {
    Button: ({ title, ...props }) => ReactLocal.createElement('mock-button', { title, ...props }),
    Checkbox: (props) => ReactLocal.createElement('mock-checkbox', props),
    DefaultKeyboardAvoidingView: ({ children }) =>
      ReactLocal.createElement('mock-keyboard-avoiding-view', {}, children),
    Input: (props) => ReactLocal.createElement('mock-input', props),
    RegularText: ({ children, ...props }) =>
      ReactLocal.createElement('mock-regular-text', props, children),
    SafeAreaViewFlex: ({ children }) => ReactLocal.createElement('mock-safe-area', {}, children),
    Wrapper: ({ children }) => ReactLocal.createElement('mock-wrapper', {}, children)
  };
});

jest.mock('../../src/config', () => ({
  colors: {
    placeholder: '#a2a2a2'
  },
  consts: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MATOMO_TRACKING: {
      SCREEN_VIEW: {
        FEEDBACK: 'feedback'
      }
    }
  },
  Icon: {
    Square: () => null,
    SquareCheckFilled: () => null
  },
  normalize: (value: number) => value,
  texts: {
    feedbackScreen: {
      alert: {
        message: 'Vielen Dank fuer Ihr Feedback!',
        title: 'Feedback'
      },
      inputsErrorMessages: {
        checkbox: 'Bitte bestaetigen Sie die Speicherung.',
        email: 'Bitte geben Sie eine gueltige E-Mail-Adresse ein.',
        hint: 'Hinweis',
        message: 'Bitte geben Sie eine Mitteilung ein.'
      },
      inputsLabel: {
        checkbox: 'Ich bin mit dem Speichern meiner Daten einverstanden.',
        email: 'E-Mail',
        message: 'Ihr Feedback zur MagdeApp',
        name: 'Name',
        requiredFields: '* Pflichtfelder'
      },
      sendButton: {
        disabled: 'Bitte warten...',
        enabled: 'Senden'
      }
    }
  }
}));

jest.mock('../../src/hooks', () => ({
  useAppInfo: () => ({ version: '1.0.0' }),
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: {
    APP_USER_CONTENT: 'APP_USER_CONTENT'
  },
  createQuery: jest.fn()
}));

import { FeedbackScreen } from '../../src/screens/FeedbackScreen';

const renderWithAct = (component: React.ReactElement) => {
  let testRenderer: renderer.ReactTestRenderer;

  renderer.act(() => {
    testRenderer = renderer.create(component);
  });

  return testRenderer!;
};

describe('FeedbackScreen accessibility', () => {
  it('configures the email field with email semantics for accessibility and autofill', () => {
    const testRenderer = renderWithAct(<FeedbackScreen route={{ params: {} }} />);

    const emailInput = testRenderer.root
      .findAllByType('mock-input')
      .find((input) => input.props.name === 'email');

    expect(emailInput).toBeDefined();
    expect(emailInput?.props.keyboardType).toBe('email-address');
    expect(emailInput?.props.textContentType).toBe('emailAddress');
    expect(emailInput?.props.autoComplete).toBe('email');
    expect(emailInput?.props.autoCapitalize).toBe('none');
  });
});
