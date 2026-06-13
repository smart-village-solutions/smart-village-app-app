import * as SecureStore from 'expo-secure-store';

import {
  getReminderSettings,
  syncWasteReminderSettingsWithServer,
  updateWasteReminderSettings
} from '../../src/pushNotifications/WasteReminder';
import { getPushTokenFromStorage } from '../../src/pushNotifications/TokenHandling';
import { ensurePushNotificationToken } from '../../src/pushNotifications/PermissionHandling';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'access-token')
}));

jest.mock('../../src/config', () => ({
  device: { platform: 'ios' },
  secrets: {
    'smart-village-app': {
      serverUrl: 'https://example.test'
    },
    staging: {
      serverUrl: 'https://example.test'
    }
  },
  staticRestSuffix: {
    wasteReminderDelete: '/notification/wastes/',
    wasteReminderRegister: '/notification/wastes.json'
  },
  texts: {
    errors: { noData: 'No data' },
    weather: { noData: 'No data' }
  }
}));

jest.mock('../../src/pushNotifications/TokenHandling', () => ({
  PushNotificationStorageKeys: { ACCESS_TOKEN: 'ACCESS_TOKEN' },
  getPushTokenFromStorage: jest.fn(async () => 'push-token'),
  serverConnectionAlert: jest.fn()
}));

jest.mock('../../src/pushNotifications/PermissionHandling', () => ({
  ensurePushNotificationToken: jest.fn(async () => undefined)
}));

describe('updateWasteReminderSettings server sync', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.fetch = jest.fn(async () => ({
      json: async () => ({ id: 123 }),
      ok: true,
      status: 201
    })) as jest.Mock;
  });

  it('sends local coverage when provided', async () => {
    await updateWasteReminderSettings(
      true,
      new Date('2000-01-01T09:00:00.000+01:00'),
      'paper',
      true,
      { city: 'Berlin', street: 'Test Street', zip: '12345' },
      undefined,
      new Date('2026-10-15T09:00:00.000+02:00')
    );

    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(requestBody.waste_registration.local_coverage_until).toBe('2026-10-15T07:00:00.000Z');
  });

  it('keeps the old payload shape when local coverage is not provided', async () => {
    await updateWasteReminderSettings(
      true,
      new Date('2000-01-01T10:01:00.000+01:00'),
      'paper',
      true,
      { city: 'Berlin', street: 'Test Street', zip: '12345' }
    );

    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(requestBody.waste_registration).not.toHaveProperty('local_coverage_until');
    expect(requestBody.waste_registration).not.toHaveProperty('reminder_slot_id');
    expect(requestBody.waste_registration.notify_at).toBe('10:01');
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('ACCESS_TOKEN');
  });

  it('uses a generated push token in dev when no stored token exists', async () => {
    (getPushTokenFromStorage as jest.Mock).mockResolvedValueOnce(undefined);

    await updateWasteReminderSettings(
      true,
      new Date('2000-01-01T09:00:00.000+01:00'),
      'paper',
      true,
      { city: 'Berlin', street: 'Test Street', zip: '12345' }
    );

    const requestBody = JSON.parse((global.fetch as jest.Mock).mock.calls[0][1].body);

    expect(requestBody.notification_device.token).toBe('ExponentPushToken[dev-waste-reminder]');
  });

  it('does not create or fake a push token when only reading reminder settings', async () => {
    (getPushTokenFromStorage as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await getReminderSettings();

    expect(result).toBeUndefined();
    expect(ensurePushNotificationToken).not.toHaveBeenCalled();
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('reports a failed sync when deleting a disabled server registration fails', async () => {
    global.fetch = jest.fn(async () => ({
      ok: false,
      status: 500
    })) as jest.Mock;

    const result = await syncWasteReminderSettingsWithServer({
      activeTypes: { paper: { active: true, storeId: 123 } },
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      notificationSettings: { paper: false },
      onDayBefore: true,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: ['paper']
    });

    expect(result.success).toBe(false);
  });

  it('sends one server registration for each active reminder registration', async () => {
    await syncWasteReminderSettingsWithServer(
      {
        activeReminderRegistrations: [
          { active: true, leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'paper' },
          { active: true, leadDays: 7, slotId: 'second', time: '18:30', typeKey: 'paper' }
        ],
        activeTypes: {},
        locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
        notificationSettings: {},
        reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
        usedTypeKeys: []
      },
      new Date('2026-10-15T09:00:00.000+02:00')
    );

    expect(global.fetch).toHaveBeenCalledTimes(2);

    const requestBodies = (global.fetch as jest.Mock).mock.calls.map((call) =>
      JSON.parse(call[1].body)
    );

    expect(requestBodies.map((body) => body.waste_registration.notify_for_waste_type)).toEqual([
      'paper',
      'paper'
    ]);
    expect(requestBodies.map((body) => body.waste_registration.notify_days_before)).toEqual([
      '1',
      '7'
    ]);
    expect(requestBodies.map((body) => body.waste_registration.reminder_slot_id)).toEqual([
      'first',
      'second'
    ]);
    expect(requestBodies.map((body) => body.waste_registration.notify_at)).toEqual([
      '09:00',
      '18:30'
    ]);
    expect(requestBodies.map((body) => body.waste_registration.local_coverage_until)).toEqual([
      '2026-10-15T07:00:00.000Z',
      '2026-10-15T07:00:00.000Z'
    ]);
  });

  it('deletes inactive flexible reminder registrations with stored server ids', async () => {
    const result = await syncWasteReminderSettingsWithServer({
      activeReminderRegistrations: [
        {
          active: false,
          leadDays: 1,
          slotId: 'first',
          storeId: 456,
          time: '09:00',
          typeKey: 'paper'
        }
      ],
      activeTypes: { paper: { active: true, storeId: 456 } },
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      notificationSettings: { paper: false },
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: ['paper']
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/notification/wastes/456.json?token=push-token'
    );
    expect((global.fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
    expect(result.success).toBe(true);
    expect(result.serverSyncPayload?.activeReminderRegistrations?.[0]).toEqual({
      active: false,
      leadDays: 1,
      slotId: 'first',
      time: '09:00',
      typeKey: 'paper'
    });
  });

  it('returns a server sync payload with new flexible registration ids', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        json: async () => ({ id: 321 }),
        ok: true,
        status: 201
      })
      .mockResolvedValueOnce({
        json: async () => ({ id: 654 }),
        ok: true,
        status: 201
      }) as jest.Mock;

    const result = await syncWasteReminderSettingsWithServer({
      activeReminderRegistrations: [
        { active: true, leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'paper' },
        { active: true, leadDays: 7, slotId: 'second', time: '18:30', typeKey: 'paper' }
      ],
      activeTypes: {},
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      notificationSettings: { paper: true },
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: ['paper']
    });

    expect(result.serverSyncPayload?.activeReminderRegistrations).toEqual([
      {
        active: true,
        leadDays: 1,
        slotId: 'first',
        storeId: 321,
        time: '09:00',
        typeKey: 'paper'
      },
      {
        active: true,
        leadDays: 7,
        slotId: 'second',
        storeId: 654,
        time: '18:30',
        typeKey: 'paper'
      }
    ]);
  });

  it('replaces existing active flexible registrations before creating updated server fallback ids', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 204
      })
      .mockResolvedValueOnce({
        json: async () => ({ id: 987 }),
        ok: true,
        status: 201
      }) as jest.Mock;

    const result = await syncWasteReminderSettingsWithServer({
      activeReminderRegistrations: [
        {
          active: true,
          leadDays: 2,
          slotId: 'first',
          storeId: 456,
          time: '10:15',
          typeKey: 'paper'
        }
      ],
      activeTypes: { paper: { active: true, storeId: 456 } },
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      notificationSettings: { paper: true },
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: ['paper']
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
    expect((global.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/notification/wastes/456.json?token=push-token'
    );
    expect((global.fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
    expect((global.fetch as jest.Mock).mock.calls[1][1].method).toBe('POST');
    expect(result.success).toBe(true);
    expect(result.serverSyncPayload?.activeReminderRegistrations?.[0]).toEqual({
      active: true,
      leadDays: 2,
      slotId: 'first',
      storeId: 987,
      time: '10:15',
      typeKey: 'paper'
    });
  });
});
