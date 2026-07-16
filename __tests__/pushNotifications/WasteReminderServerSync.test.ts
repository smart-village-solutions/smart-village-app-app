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
    prignitz: {
      serverUrl: 'https://example.test'
    },
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
  it('retains an active disruption as pending when the server returns 422', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({
      json: async () => ({ errors: ['invalid disruption registration'] }),
      ok: false,
      status: 422
    }) as jest.Mock;

    const result = await syncWasteReminderSettingsWithServer({
      activeTypes: {},
      disruptionRegistrations: { disruption_all_locations: { active: true } },
      notificationSettings: {},
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: []
    });

    expect(result.success).toBe(false);
    expect(result.serverSyncPayload.disruptionRegistrations?.disruption_all_locations).toEqual({
      active: true
    });
  });

  it('deletes a hydrated disruption registration by its stored id', async () => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true, status: 202 }) as jest.Mock;

    const result = await syncWasteReminderSettingsWithServer({
      activeTypes: {},
      disruptionRegistrations: {
        disruption_all_locations: { active: false, storeId: 77 }
      },
      notificationSettings: {},
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: []
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.test/notification/wastes/77.json',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'X-Notification-Device-Token': 'push-token'
        }),
        method: 'DELETE'
      })
    );
    expect(result.success).toBe(true);
    expect(result.serverSyncPayload.disruptionRegistrations?.disruption_all_locations).toEqual({
      active: false
    });
  });

  it('posts canonical neutral local and global disruption registrations', async () => {
    globalThis.fetch = jest
      .fn()
      .mockResolvedValue({ json: async () => ({ id: 44 }), ok: true, status: 201 }) as jest.Mock;

    const result = await syncWasteReminderSettingsWithServer({
      activeTypes: {},
      disruptionRegistrations: {
        disruption_all_locations: { active: true },
        disruption_location: { active: true }
      },
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      notificationSettings: {},
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      usedTypeKeys: []
    });

    const bodies = (globalThis.fetch as jest.Mock).mock.calls.map(
      (call) => JSON.parse(call[1].body).waste_registration
    );
    expect(bodies).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          city: '',
          notify_at: '00:00',
          notify_days_before: '0',
          notify_for_waste_type: 'disruption_all_locations',
          street: '',
          zip: ''
        }),
        expect.objectContaining({
          city: 'Berlin',
          notify_at: '00:00',
          notify_days_before: '0',
          notify_for_waste_type: 'disruption_location',
          street: 'Test Street',
          zip: '12345'
        })
      ])
    );
    expect(result.success).toBe(true);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    globalThis.fetch = jest.fn(async () => ({
      json: async () => ({ id: 123 }),
      ok: true,
      status: 201
    })) as jest.Mock;
  });

  it('sends local coverage when provided', async () => {
    await updateWasteReminderSettings({
      isActive: true,
      localCoverageUntil: new Date('2026-10-15T09:00:00.000+02:00'),
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      onDayBefore: true,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      typeKey: 'paper'
    });

    const requestBody = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);

    expect(requestBody.waste_registration.local_coverage_until).toBe('2026-10-15T07:00:00.000Z');
  });

  it('keeps the old payload shape when local coverage is not provided', async () => {
    await updateWasteReminderSettings({
      isActive: true,
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      onDayBefore: true,
      reminderTime: new Date('2000-01-01T10:01:00.000+01:00'),
      typeKey: 'paper'
    });

    const requestBody = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);

    expect(requestBody.waste_registration).not.toHaveProperty('local_coverage_until');
    expect(requestBody.waste_registration).not.toHaveProperty('reminder_slot_id');
    expect(requestBody.waste_registration.notify_at).toBe('10:01');
    expect(requestBody.notification_device).toEqual({ device_type: 'ios' });
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/notification/wastes.json'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer access-token',
        'X-Notification-Device-Token': 'push-token'
      })
    );
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith('ACCESS_TOKEN');
  });

  it('uses a generated push token in dev when no stored token exists', async () => {
    (getPushTokenFromStorage as jest.Mock).mockResolvedValueOnce(undefined);

    await updateWasteReminderSettings({
      isActive: true,
      locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
      onDayBefore: true,
      reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
      typeKey: 'paper'
    });

    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        'X-Notification-Device-Token': 'ExponentPushToken[dev-waste-reminder]'
      })
    );
  });

  it('does not create or fake a push token when only reading reminder settings', async () => {
    (getPushTokenFromStorage as jest.Mock).mockResolvedValueOnce(undefined);

    const result = await getReminderSettings();

    expect(result).toBeUndefined();
    expect(ensurePushNotificationToken).not.toHaveBeenCalled();
    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('reads reminder settings with the token header and no token in the URL', async () => {
    await getReminderSettings();

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://example.test/notification/wastes.json',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer access-token',
          'X-Notification-Device-Token': 'push-token'
        })
      })
    );
  });

  it('reports a failed sync when deleting a disabled server registration fails', async () => {
    globalThis.fetch = jest.fn(async () => ({
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

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);

    const requestBodies = (globalThis.fetch as jest.Mock).mock.calls.map((call) =>
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

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][0]).toBe(
      'https://example.test/notification/wastes/456.json'
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].method).toBe('DELETE');
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer access-token',
        'X-Notification-Device-Token': 'push-token'
      })
    );
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
    globalThis.fetch = jest
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

  it('updates an existing active flexible registration without deleting it first', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
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

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].method).toBe('POST');
    expect(JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body)).toEqual(
      expect.objectContaining({
        notification_device: { device_type: 'ios' },
        waste_registration: expect.objectContaining({
          city: 'Berlin',
          notify_for_waste_type: 'paper',
          reminder_slot_id: 'first',
          street: 'Test Street',
          zip: '12345'
        })
      })
    );
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].headers).toEqual(
      expect.objectContaining({
        Authorization: 'Bearer access-token',
        'X-Notification-Device-Token': 'push-token'
      })
    );
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

  it('keeps an existing active flexible registration when its update fails', async () => {
    globalThis.fetch = jest.fn().mockResolvedValueOnce({
      json: async () => ({ errors: ['temporary failure'] }),
      ok: false,
      status: 500
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

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    expect((globalThis.fetch as jest.Mock).mock.calls[0][1].method).toBe('POST');
    expect(result.success).toBe(false);
    expect(result.serverSyncPayload?.activeReminderRegistrations?.[0]).toEqual({
      active: true,
      leadDays: 2,
      slotId: 'first',
      storeId: 456,
      time: '10:15',
      typeKey: 'paper'
    });
  });
});
