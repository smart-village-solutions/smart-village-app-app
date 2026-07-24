/* eslint-disable @typescript-eslint/no-var-requires */
import React from 'react';
import { Alert } from 'react-native';
import renderer from 'react-test-renderer';

const mockGoBack = jest.fn();
let mockValidationErrors: Record<string, { message: string }> | null = null;

jest.mock('react-native', () => {
  const ReactLocal = require('react');

  return {
    Alert: {
      alert: jest.fn()
    },
    Keyboard: {
      dismiss: jest.fn()
    },
    ScrollView: ({ children, ...props }) =>
      ReactLocal.createElement('mock-scroll-view', props, children),
    StyleSheet: {
      create: (styles) => styles
    }
  };
});

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: mockGoBack,
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
    handleSubmit: (onValid, onInvalid) => (data) =>
      mockValidationErrors ? onInvalid(mockValidationErrors) : onValid(data)
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
        ok: 'OK',
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
  beforeEach(() => {
    jest.clearAllMocks();
    mockValidationErrors = null;
  });

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

  it('keeps the success status alert focused until it is acknowledged', async () => {
    const testRenderer = renderWithAct(<FeedbackScreen route={{ params: {} }} />);
    const sendButton = testRenderer.root.findByType('mock-button');

    await renderer.act(async () => {
      await sendButton.props.onPress({
        consent: true,
        email: 'person@example.com',
        message: 'Feedback',
        name: 'Person',
        phone: ''
      });
    });

    expect(Alert.alert).toHaveBeenCalledWith('Feedback', 'Vielen Dank fuer Ihr Feedback!', [
      expect.objectContaining({ text: 'OK', onPress: expect.any(Function) })
    ]);
    expect(mockGoBack).not.toHaveBeenCalled();

    const alertActions = (Alert.alert as jest.Mock).mock.calls[0][2];
    renderer.act(() => alertActions[0].onPress());

    expect(mockGoBack).toHaveBeenCalledTimes(1);
  });

  it('presents the first validation status in an automatically focused alert', () => {
    mockValidationErrors = {
      message: { message: 'Bitte geben Sie eine Mitteilung ein.' }
    };
    const testRenderer = renderWithAct(<FeedbackScreen route={{ params: {} }} />);
    const sendButton = testRenderer.root.findByType('mock-button');

    renderer.act(() => sendButton.props.onPress({}));

    expect(Alert.alert).toHaveBeenCalledWith('Hinweis', 'Bitte geben Sie eine Mitteilung ein.');
    expect(mockGoBack).not.toHaveBeenCalled();
  });
});
