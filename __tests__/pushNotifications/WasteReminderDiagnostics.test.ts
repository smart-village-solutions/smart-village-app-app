import * as Sentry from '@sentry/react-native';

import {
  buildWasteReminderDiagnostic,
  reportWasteReminderSchedulingTransition
} from '../../src/pushNotifications/WasteReminderDiagnostics';

jest.mock('@sentry/react-native', () => ({
  captureMessage: jest.fn()
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.2.3'
}));

jest.mock('expo-device', () => ({
  manufacturer: 'Samsung',
  modelName: 'Test Model'
}));

describe('WasteReminderDiagnostics', () => {
  it('builds only aggregate allowlisted diagnostic fields', () => {
    expect(
      buildWasteReminderDiagnostic({
        actualCount: 0,
        errorClass: 'native-verification-mismatch',
        expectedCount: 3,
        schedulingStatus: 'failed'
      })
    ).toEqual({
      actualCount: 0,
      androidVersion: undefined,
      appVersion: '1.2.3',
      errorClass: 'native-verification-mismatch',
      expectedCount: 3,
      manufacturer: 'Samsung',
      model: 'Test Model',
      schedulingStatus: 'failed'
    });
  });

  it('sends a fixed message without a raw error or forbidden fields', () => {
    reportWasteReminderSchedulingTransition({
      errorClass: 'native-schedule-error',
      expectedCount: 2,
      schedulingStatus: 'failed'
    });

    expect(Sentry.captureMessage).toHaveBeenCalledWith(
      'waste_reminder_scheduling',
      expect.objectContaining({
        contexts: {
          wasteReminder: expect.objectContaining({
            errorClass: 'native-schedule-error',
            expectedCount: 2,
            schedulingStatus: 'failed'
          })
        },
        level: 'warning'
      })
    );
    const serialized = JSON.stringify((Sentry.captureMessage as jest.Mock).mock.calls[0]);
    [
      'street',
      'city',
      'zip',
      'token',
      'ownerKey',
      'wasteType',
      'notificationId',
      'reminderKey',
      'pickupDate',
      'reminderAt',
      'content',
      'message',
      'stack'
    ].forEach((forbiddenField) => expect(serialized).not.toContain(forbiddenField));
  });
});
