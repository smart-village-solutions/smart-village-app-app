/* eslint-disable @typescript-eslint/no-var-requires, react/prop-types */
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';

import { FeedbackScreen } from '../../src/screens/FeedbackScreen';
import { SettingsContext, initialContext } from '../../src/SettingsProvider';
import { getInAppPermission } from '../../src/pushNotifications/PermissionHandling';
import { getPushTokenFromStorage } from '../../src/pushNotifications/TokenHandling';

const mockAlert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);

const mockCreateAppUserContent = jest.fn();
const mockCollectDeviceInfo = jest.fn();
const mockGoBack = jest.fn();
let mockPlatform = 'ios';
const mockFormData = {
  name: 'Erika Beispiel',
  email: 'erika@example.org',
  phone: '0123',
  message: 'Test feedback',
  consent: true,
  includeDiagnosticInformation: false
};

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('expo-calendar', () => ({
  getCalendarPermissionsAsync: jest.fn(),
  getRemindersPermissionsAsync: jest.fn()
}));
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    getMicrophonePermissionsAsync: jest.fn()
  }
}));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn()
}));
jest.mock('expo-media-library', () => ({ getPermissionsAsync: jest.fn() }));
jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  getNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn()
}));
jest.mock('../../src/pushNotifications/PermissionHandling', () => ({
  getInAppPermission: jest.fn()
}));
jest.mock('../../src/pushNotifications/TokenHandling', () => ({
  PushNotificationStorageKeys: { PUSH_TOKEN: 'PUSH_TOKEN' },
  getPushTokenFromStorage: jest.fn()
}));

jest.mock('expo-router/react-navigation', () => ({
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
  device: {
    get platform() {
      return mockPlatform;
    }
  },
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
      diagnosticInformationHints: {
        permissions: 'Die Diagnose zeigt die App-Berechtigungen.',
        pushInformation: 'Die Push-Diagnose enthält App-Einstellung und Token-Status.',
        pushInformationAndroid:
          'Die Push-Diagnose enthält App-Einstellung, Token-Status und Push-Kanal.',
        systemInformation: 'Die Diagnose enthält Systeminformationen.',
        wasteConfiguration: 'Die Diagnose enthält die Abfall-Konfiguration.',
        wasteDisruptionNotifications: 'Die Diagnose enthält die Störungshinweis-Schalter.',
        wasteReminderScheduling: 'Die Diagnose dokumentiert die geplanten Erinnerungen.'
      },
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

jest.mock('../../src/helpers/appUserContentHelper', () => ({
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

const renderAndSubmit = async (feedback, waste = {}) => {
  const globalSettings = {
    ...initialContext.globalSettings,
    settings: { feedback },
    waste
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
    mockPlatform = 'ios';
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

  it.each([
    { includeSystemInformation: true },
    { includePermissions: true },
    { includePushInformation: true },
    { includeWasteConfiguration: true },
    { includeWasteDisruptionNotifications: true },
    { includeWasteReminderScheduling: true },
    { includeScheduledNotifications: true }
  ])('offers diagnostic information for active feedback settings %#', async (settings) => {
    const component = await renderAndSubmit(settings);

    expect(
      component.root.findByProps({
        children: 'Diagnoseinformationen mitsenden'
      })
    ).toBeTruthy();
    expect(component.root.findByProps({ children: 'Consent *' })).toBeTruthy();
    expect(component.root.findByProps({ testID: 'diagnostic-information-hint' })).toBeTruthy();
    expect(mockCollectDeviceInfo).not.toHaveBeenCalled();
  });

  it('always shows the configured diagnostic information separately before consent', async () => {
    const component = await renderAndSubmit({ includeSystemInformation: true });

    expect(component.root.findByProps({ children: 'Consent *' })).toBeTruthy();
    expect(
      component.root.findByProps({
        children: 'Die Diagnose enthält Systeminformationen.'
      })
    ).toMatchObject({
      props: {
        placeholder: true,
        smallest: true,
        testID: 'diagnostic-information-hint'
      }
    });
    expect(mockCollectDeviceInfo).not.toHaveBeenCalled();
  });

  it('collects diagnostics only after opt-in', async () => {
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit({ includeSystemInformation: true });

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({
      settings: { includeSystemInformation: true },
      wasteSettings: {}
    });
  });

  it('describes every enabled legacy diagnostic category outside the consent label', async () => {
    mockFormData.includeDiagnosticInformation = true;

    const component = await renderAndSubmit({ includeScheduledNotifications: true });

    expect(
      component.root.findByProps({
        children:
          'Die Diagnose zeigt die App-Berechtigungen. Die Push-Diagnose enthält App-Einstellung und Token-Status. Die Diagnose enthält die Abfall-Konfiguration. Die Diagnose dokumentiert die geplanten Erinnerungen.'
      })
    ).toBeTruthy();
    expect(component.root.findByProps({ children: 'Consent *' })).toBeTruthy();
  });

  it('describes only the granularly enabled diagnostic categories', async () => {
    mockFormData.includeDiagnosticInformation = true;

    const component = await renderAndSubmit({
      includePermissions: true,
      includeWasteReminderScheduling: true
    });

    expect(
      component.root.findByProps({
        children:
          'Die Diagnose zeigt die App-Berechtigungen. Die Diagnose dokumentiert die geplanten Erinnerungen.'
      })
    ).toBeTruthy();
  });

  it('describes and forwards the separately enabled disruption notification switches', async () => {
    mockFormData.includeDiagnosticInformation = true;
    const wasteSettings = {
      disruptionNotificationSettings: {
        disruption_all_locations: true,
        disruption_location: false
      }
    };

    const component = await renderAndSubmit(
      { includeWasteDisruptionNotifications: true },
      wasteSettings
    );

    expect(
      component.root.findByProps({
        children: 'Die Diagnose enthält die Störungshinweis-Schalter.'
      })
    ).toBeTruthy();
    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({
      settings: { includeWasteDisruptionNotifications: true },
      wasteSettings
    });
  });

  it('mentions the push channel normally on Android and omits it on iOS', async () => {
    const iosComponent = await renderAndSubmit({ includePushInformation: true });

    expect(
      iosComponent.root.findByProps({
        children: 'Die Push-Diagnose enthält App-Einstellung und Token-Status.'
      })
    ).toBeTruthy();

    mockPlatform = 'android';
    const androidComponent = await renderAndSubmit({ includePushInformation: true });

    expect(
      androidComponent.root.findByProps({
        children: 'Die Push-Diagnose enthält App-Einstellung, Token-Status und Push-Kanal.'
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

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({ settings, wasteSettings: {} });
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

  it('adds minimized waste push diagnostics beside unchanged appInfo', async () => {
    const settings = { includeScheduledNotifications: true };
    const deviceInfo = {
      wastePushDiagnostics: {
        push: { token: { present: true } },
        scheduling: { nativeWasteNotificationCount: 1 }
      }
    };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit(settings);

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({ settings, wasteSettings: {} });
    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
  });

  it('forwards both flags and submits only once', async () => {
    const settings = {
      includeSystemInformation: true,
      includeWastePushDiagnostics: true
    };
    const deviceInfo = {
      device: {},
      operatingSystem: {},
      wastePushDiagnostics: {}
    };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit(settings);

    expect(mockCollectDeviceInfo).toHaveBeenCalledWith({ settings, wasteSettings: {} });
    expect(mockCreateAppUserContent).toHaveBeenCalledTimes(1);
    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
  });

  it('sends a stable collector failure status', async () => {
    const deviceInfo = { collectionStatus: { wastePushDiagnostics: 'failed' } };
    mockCollectDeviceInfo.mockResolvedValue(deviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit({ includeScheduledNotifications: true });

    expect(sentPayload()).toEqual({ ...basePayload, deviceInfo });
  });

  it('never serializes forbidden diagnostic fixtures into GraphQL content', async () => {
    const diagnosticStreet = 'Private Street 12';
    const forbidden = [
      'private-token',
      'Private notification title',
      'Private notification body',
      'raw-notification-id',
      'raw-reminder-key'
    ];
    const permission = {
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never'
    };
    [
      Notifications.getPermissionsAsync,
      Location.getForegroundPermissionsAsync,
      Location.getBackgroundPermissionsAsync,
      Camera.getCameraPermissionsAsync,
      Camera.getMicrophonePermissionsAsync,
      MediaLibrary.getPermissionsAsync,
      Calendar.getCalendarPermissionsAsync,
      Calendar.getRemindersPermissionsAsync
    ].forEach((getter) => getter.mockResolvedValue(permission));
    getInAppPermission.mockResolvedValue(true);
    getPushTokenFromStorage.mockResolvedValue(forbidden[0]);
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: forbidden[3],
        content: {
          title: forbidden[1],
          body: forbidden[2],
          data: { query_type: 'WasteAddresses', reminderKey: forbidden[4] }
        }
      }
    ]);
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        ownerKey: 'anonymous',
        scheduledNotificationIds: [forbidden[3]],
        scheduledReminderKeys: [forbidden[4]],
        scheduling: {
          actualCount: 1,
          attemptCount: 1,
          expectedCount: 1,
          lastAttemptAt: '2026-07-24T12:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: {
          activeTypes: { paper: { active: true } },
          locationData: { street: diagnosticStreet },
          notificationSettings: { paper: true },
          reminderTime: '2026-01-01',
          usedTypeKeys: ['paper']
        }
      })
    );
    const { collectDeviceInfo } = jest.requireActual('../../src/helpers/appUserContentHelper');
    mockCollectDeviceInfo.mockImplementation(collectDeviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit(
      {
        includeWasteDisruptionNotifications: true,
        includeWastePushDiagnostics: true
      },
      {
        disruptionNotificationSettings: {
          disruption_all_locations: true,
          disruption_location: false
        }
      }
    );

    const serializedContent = mockCreateAppUserContent.mock.calls[0][0].variables.content;
    expect(sentPayload().deviceInfo.wastePushDiagnostics).toMatchObject({
      disruptionNotifications: {
        allLocationsEnabled: true,
        ownLocationEnabled: false
      },
      push: { token: { present: true, ownerState: 'anonymous' } },
      wasteConfiguration: { location: { street: diagnosticStreet } },
      scheduling: {
        currentNativeInventory: { scheduledWasteNotificationCount: 1 },
        lastSchedulingAttempt: {
          calculatedCount: 1,
          verifiedScheduledCount: 1
        }
      }
    });
    expect(sentPayload().deviceInfo.permissions.notifications).toMatchObject({
      granted: true,
      status: 'granted'
    });
    expect(sentPayload().deviceInfo.wastePushDiagnostics).not.toHaveProperty('permissions');
    expect(sentPayload().deviceInfo.wastePushDiagnostics.push).not.toHaveProperty(
      'systemPermission'
    );
    forbidden.forEach((value) => expect(serializedContent).not.toContain(value));
  });

  it('serializes only the corrupt active-registration reason code into GraphQL content', async () => {
    const forbidden = [
      'private-token',
      'Private notification title',
      'Private notification body',
      'raw-notification-id',
      'raw-reminder-key',
      'rejected-registration-secret',
      'rejected-registration-slot',
      'rejected-registration-time',
      'rejected-registration-type'
    ];
    const permission = {
      status: 'granted',
      granted: true,
      canAskAgain: true,
      expires: 'never'
    };
    [
      Notifications.getPermissionsAsync,
      Location.getForegroundPermissionsAsync,
      Location.getBackgroundPermissionsAsync,
      Camera.getCameraPermissionsAsync,
      Camera.getMicrophonePermissionsAsync,
      MediaLibrary.getPermissionsAsync,
      Calendar.getCalendarPermissionsAsync,
      Calendar.getRemindersPermissionsAsync
    ].forEach((getter) => getter.mockResolvedValue(permission));
    getInAppPermission.mockResolvedValue(true);
    getPushTokenFromStorage.mockResolvedValue(forbidden[0]);
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      {
        identifier: forbidden[3],
        content: {
          title: forbidden[1],
          body: forbidden[2],
          data: { query_type: 'WasteAddresses', reminderKey: forbidden[4] }
        }
      }
    ]);
    AsyncStorage.getItem.mockResolvedValue(
      JSON.stringify({
        ownerKey: 'anonymous',
        scheduledNotificationIds: [forbidden[3]],
        scheduledReminderKeys: [forbidden[4]],
        serverSyncPayload: {
          activeReminderRegistrations: [
            {
              active: 'rejected-registration-secret',
              leadDays: 1,
              slotId: 'rejected-registration-slot',
              time: 'rejected-registration-time',
              typeKey: 'rejected-registration-type'
            }
          ],
          notificationSettings: { paper: true },
          reminderTime: '2026-01-01',
          usedTypeKeys: ['paper']
        }
      })
    );
    const { collectDeviceInfo } = jest.requireActual('../../src/helpers/appUserContentHelper');
    mockCollectDeviceInfo.mockImplementation(collectDeviceInfo);
    mockFormData.includeDiagnosticInformation = true;

    await renderAndSubmit({ includeWastePushDiagnostics: true });

    const serializedContent = mockCreateAppUserContent.mock.calls[0][0].variables.content;
    expect(sentPayload().deviceInfo.wastePushDiagnostics).toMatchObject({
      push: { token: { present: true, ownerState: 'invalid-local-state' } },
      wasteConfiguration: {
        localStateErrors: ['invalid-active-registration'],
        localStateStatus: 'corrupt'
      },
      scheduling: {
        currentNativeInventory: { scheduledWasteNotificationCount: 1 }
      }
    });
    forbidden.forEach((value) => expect(serializedContent).not.toContain(value));
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
