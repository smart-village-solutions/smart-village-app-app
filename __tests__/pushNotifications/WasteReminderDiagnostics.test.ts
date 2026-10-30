import * as Sentry from '@sentry/react-native';

import {
  buildWasteReminderDiagnostic,
  reportWasteReminderMaintenanceSync,
  reportWasteReminderOwnerMigration,
  reportWasteReminderSchedulingTransition
} from '../../src/pushNotifications/WasteReminderDiagnostics';

jest.mock('@sentry/react-native', () => ({
  captureMessage: jest.fn(),
  addBreadcrumb: jest.fn()
}));

jest.mock('expo-application', () => ({
  nativeApplicationVersion: '1.2.3'
}));

jest.mock('expo-device', () => ({
  manufacturer: 'Samsung',
  modelName: 'Test Model'
}));

describe('WasteReminderDiagnostics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

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

  it('reports lifecycle outcomes with fixed messages and enum-only contexts', () => {
    reportWasteReminderOwnerMigration('migrated');
    reportWasteReminderOwnerMigration('unchanged');
    reportWasteReminderMaintenanceSync('failed-pending');

    expect(Sentry.addBreadcrumb).toHaveBeenNthCalledWith(1, {
      category: 'wasteReminder',
      message: 'waste_reminder_owner_migration',
      data: { outcome: 'migrated' },
      level: 'info'
    });
    expect(Sentry.addBreadcrumb).toHaveBeenNthCalledWith(2, {
      category: 'wasteReminder',
      message: 'waste_reminder_owner_migration',
      data: { outcome: 'unchanged' },
      level: 'debug'
    });
    expect(Sentry.captureMessage).toHaveBeenNthCalledWith(1, 'waste_reminder_maintenance_sync', {
      contexts: { wasteReminder: { outcome: 'failed-pending' } },
      level: 'warning'
    });
    const serialized = JSON.stringify((Sentry.captureMessage as jest.Mock).mock.calls);
    ['token-a', 'token-b', 'ownerKey', 'storeId', 'payload', 'notificationId', 'stack'].forEach(
      (value) => expect(serialized).not.toContain(value)
    );
  });
  it('keeps successful scheduling and routine maintenance out of the issue stream', () => {
    reportWasteReminderSchedulingTransition({
      actualCount: 42,
      expectedCount: 42,
      schedulingStatus: 'scheduled'
    });
    reportWasteReminderOwnerMigration('deferred-no-token');
    reportWasteReminderMaintenanceSync('synced');
    reportWasteReminderMaintenanceSync('skipped-no-token');
    expect(Sentry.captureMessage).not.toHaveBeenCalled();
    expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(4);
    expect(Sentry.addBreadcrumb).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'waste_reminder_scheduling',
        data: expect.objectContaining({ actualCount: 42, expectedCount: 42 })
      })
    );
  });
});
