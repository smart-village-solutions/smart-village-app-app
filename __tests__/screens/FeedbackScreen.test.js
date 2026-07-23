/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';

import { FeedbackScreen } from '../../src/screens/FeedbackScreen';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';

const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

const mockCreateAppUserContent = jest.fn();
const mockCollectDeviceInfo = jest.fn();
const mockGoBack = jest.fn();
const mockFormData = {
  name: 'Erika Beispiel',
  email: 'erika@example.org',
  phone: '0123',
  message: 'Test feedback',
  consent: true,
  includeDiagnosticInformation: false
};

jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack, navigate: jest.fn() })
}));

jest.mock('react-apollo', () => ({
  useMutation: () => [mockCreateAppUserContent]
}));

jest.mock('react-hook-form', () => ({
  Controller: ({ name, render }) =>
    render({
      field: {
        onChange: (value) => {
          mockFormData[name] = value;
        },
        value: mockFormData[name]
      }
    }),
  useForm: () => ({
    control: {},
    formState: { errors: {} },
    handleSubmit: (onSubmit) => () => onSubmit(mockFormData),
    watch: (name) => mockFormData[name]
  })
}));

jest.mock('../../src/components', () => {
  const { Pressable, Text, View } = require('react-native');

  return {
    Button: ({ disabled, onPress, title }) => (
      <Pressable testID="submit" disabled={disabled} onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
    Checkbox: ({ title, ...props }) => (
      <Pressable {...props}>
        <Text>{title}</Text>
      </Pressable>
    ),
    DefaultKeyboardAvoidingView: ({ children }) => <View>{children}</View>,
    Input: () => null,
    RegularText: ({ children, ...props }) => <Text {...props}>{children}</Text>,
    SafeAreaViewFlex: ({ children }) => <View>{children}</View>,
    Wrapper: ({ children }) => <View>{children}</View>
  };
});

jest.mock('../../src/config', () => ({
  Icon: { Square: () => null, SquareCheckFilled: () => null },
  colors: { placeholder: '#000000' },
  consts: { MATOMO_TRACKING: { SCREEN_VIEW: { FEEDBACK: 'feedback' } }, EMAIL_REGEX: /.+/ },
  normalize: (value) => value,
  texts: {
    feedbackScreen: {
      alert: {
        errorMessage: 'Please try again',
        errorTitle: 'Send failed',
        title: 'Success',
        message: 'Sent',
        ok: 'OK'
      },
      diagnosticInformationHint:
        'Es werden zusätzlich Geräte- und Betriebssysteminformationen übermittelt.',
      scheduledNotificationsInformationHint:
        'Es werden zusätzlich Informationen über lokal gespeicherte Push-Benachrichtigungen übermittelt.',
      inputsErrorMessages: {
        hint: 'Hint',
        checkbox: 'Consent',
        email: 'Email',
        message: 'Message'
      },
      inputsLabel: {
        checkbox: 'Consent',
        email: 'Email',
        includeDiagnosticInformation: 'Diagnoseinformationen mitsenden',
        message: 'Message',
        name: 'Name',
        phone: 'Phone',
        requiredFields: 'Required'
      },
      sendButton: { disabled: 'Sending', enabled: 'Send' }
    }
  }
}));

jest.mock('../../src/helpers', () => ({
  collectDeviceInfo: (...args) => mockCollectDeviceInfo(...args)
}));

const appInfo = {
  appVersion: '4.3.0',
  buildNumber: '123',
  otaVersion: 1,
  route: 'Feedback'
};

jest.mock('../../src/hooks', () => ({
  useAppInfo: () => appInfo,
  useMatomoTrackScreenView: jest.fn()
}));

jest.mock('../../src/queries', () => ({
  QUERY_TYPES: { APP_USER_CONTENT: 'APP_USER_CONTENT' },
  createQuery: jest.fn(() => 'mutation')
}));

const route = { params: {} };
const basePayload = {
  name: mockFormData.name,
  email: mockFormData.email,
  phone: mockFormData.phone,
  message: mockFormData.message,
  consent: mockFormData.consent,
  appInfo
};

const renderAndSubmit = async (feedback) => {
  const globalSettings = {
    ...initialContext.globalSettings,
    settings: { feedback }
  };
  let component;

  await act(async () => {
    component = renderer.create(
      <SettingsContext.Provider value={{ ...initialContext, globalSettings }}>
        <FeedbackScreen route={route} />
      </SettingsContext.Provider>
    );
  });

  await act(async () => {
    await component.root.findByProps({ testID: 'submit' }).props.onPress();
  });

  return component;
};

const sentPayload = () => JSON.parse(mockCreateAppUserContent.mock.calls[0][0].variables.content);

describe('FeedbackScreen diagnostic payload', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCreateAppUserContent.mockResolvedValue({});
    mockCollectDeviceInfo.mockResolvedValue(undefined);
    mockFormData.consent = true;
    mockFormData.includeDiagnosticInformation = false;
  });

  it('sends the unchanged payload without active flags', async () => {
    const component = await renderAndSubmit(undefined);

    expect(mockCollectDeviceInfo).not.toHaveBeenCalled();
    expect(sentPayload()).toEqual(basePayload);
    expect(sentPayload()).not.toHaveProperty('deviceInfo');
    expect(
      component.root.findAllByProps({
        children: 'Diagnoseinformationen mitsenden'
      })
    ).toHaveLength(0);
  });

  it.each([{ includeSystemInformation: true }, { includeScheduledNotifications: true }])(
    'offers diagnostic information for active feedback settings %#',
    async (settings) => {
      const component = await renderAndSubmit(settings);

      expect(
        component.root.findByProps({
          children: 'Diagnoseinformationen mitsenden'
        })
      ).toBeTruthy();
      expect(component.root.findByProps({ children: 'Consent *' })).toBeTruthy();
      expect(mockCollectDeviceInfo).not.toHaveBeenCalled();
    }
  );

  it('appends diagnostic information inline before the required marker after opt-in', async () => {
    mockFormData.includeDiagnosticInformation = true;

    const component = await renderAndSubmit({ includeSystemInformation: true });
    const consentTitle =
      'Consent Es werden zusätzlich Geräte- und Betriebssysteminformationen übermittelt. *';

    expect(component.root.findByProps({ children: consentTitle })).toBeTruthy();
    expect(consentTitle).not.toContain('\n');
    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({
      settings: { includeSystemInformation: true }
    });
  });

  it('describes scheduled notifications inline when they are included', async () => {
    mockFormData.includeDiagnosticInformation = true;

    const component = await renderAndSubmit({ includeScheduledNotifications: true });

    expect(
      component.root.findByProps({
        children:
          'Consent Es werden zusätzlich Informationen über lokal gespeicherte Push-Benachrichtigungen übermittelt. *'
      })
    ).toBeTruthy();
  });

  it('adds system information beside unchanged appInfo', async () => {
    const settings = { includeSystemInformation: true };
    const deviceInfo = {
      device: { deviceName: 'Phone' },
      operatingSystem: { name: 'TestOS' }
    };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit(settings);

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({ settings });
    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
    const forbiddenKeys = [
      'appVersion',
      'buildNumber',
      'otaVersion',
      'route',
      'nativeApplicationVersion',
      'nativeBuildVersion'
    ];
    forbiddenKeys.forEach((key) => {
      expect(sentPayload().deviceInfo).not.toHaveProperty(key);
      expect(sentPayload().deviceInfo.device).not.toHaveProperty(key);
      expect(sentPayload().deviceInfo.operatingSystem).not.toHaveProperty(key);
    });
  });

  it('adds scheduled notifications beside unchanged appInfo', async () => {
    const settings = { includeScheduledNotifications: true };
    const deviceInfo = {
      scheduledNotifications: [{ identifier: 'one', content: {}, trigger: null }]
    };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit(settings);

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({ settings });
    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
  });

  it('forwards both flags and submits only once', async () => {
    const settings = {
      includeSystemInformation: true,
      includeScheduledNotifications: true
    };
    const deviceInfo = {
      device: {},
      operatingSystem: {},
      scheduledNotifications: []
    };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit(settings);

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({ settings });
    expect(mockCreateAppUserContent).toHaveBeenCalledTimes(1);
    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
  });

  it('sends a stable collector failure status', async () => {
    const deviceInfo = { collectionStatus: { scheduledNotifications: 'failed' } };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit({ includeScheduledNotifications: true });

    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
  });

  it('does not collect or submit without consent', async () => {
    mockFormData.consent = false;

    await renderAndSubmit({ includeSystemInformation: true });

    expect(mockCollectDeviceInfo).not.toHaveBeenCalled();
    expect(mockCreateAppUserContent).not.toHaveBeenCalled();
    expect(mockGoBack).not.toHaveBeenCalled();
  });

  it('continues with base feedback after an unexpected helper rejection', async () => {
    mockCollectDeviceInfo.mockRejectedValue(new Error('unexpected collector bug'));
    mockFormData.includeDiagnosticInformation = true;

    const component = await renderAndSubmit({ includeSystemInformation: true });

    expect(mockCreateAppUserContent).toHaveBeenCalledTimes(1);
    expect(sentPayload()).toEqual(basePayload);
    expect(mockGoBack).not.toHaveBeenCalled();
    const successAction = mockAlert.mock.calls.find(([title]) => title === 'Success')[2][0];
    successAction.onPress();
    expect(mockGoBack).toHaveBeenCalledTimes(1);
    expect(component.root.findByProps({ testID: 'submit' }).props.disabled).toBe(false);
  });

  it('keeps the form open and shows an error when sending fails', async () => {
    mockCreateAppUserContent.mockRejectedValue(new Error('network error'));

    const component = await renderAndSubmit(undefined);

    expect(mockAlert).toHaveBeenCalledWith('Send failed', 'Please try again');
    expect(mockGoBack).not.toHaveBeenCalled();
    expect(component.root.findByProps({ testID: 'submit' }).props.disabled).toBe(false);
  });
});
