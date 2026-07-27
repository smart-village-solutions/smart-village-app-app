import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { collectWastePushDiagnostics } from '../../src/helpers/wastePushDiagnosticsHelper';
import { getInAppPermission } from '../../src/pushNotifications/PermissionHandling';
import { getPushTokenFromStorage } from '../../src/pushNotifications/TokenHandling';
import { getWasteReminderOwnerKeyForToken } from '../../src/pushNotifications/WasteReminderLocalStorage';

jest.mock('@react-native-async-storage/async-storage', () => ({ getItem: jest.fn() }));
jest.mock('expo-calendar', () => ({
  getCalendarPermissionsAsync: jest.fn(),
  getRemindersPermissionsAsync: jest.fn(),
  requestCalendarPermissionsAsync: jest.fn(),
  requestRemindersPermissionsAsync: jest.fn()
}));
jest.mock('expo-camera', () => ({
  Camera: {
    getCameraPermissionsAsync: jest.fn(),
    getMicrophonePermissionsAsync: jest.fn(),
    requestCameraPermissionsAsync: jest.fn(),
    requestMicrophonePermissionsAsync: jest.fn()
  }
}));
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  getBackgroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn()
}));
jest.mock('expo-media-library', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn()
}));
jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  getNotificationChannelAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn()
}));
jest.mock('../../src/pushNotifications/PermissionHandling', () => ({
  getInAppPermission: jest.fn()
}));
jest.mock('../../src/pushNotifications/TokenHandling', () => ({
  getPushTokenFromStorage: jest.fn()
}));
jest.mock('../../src/pushNotifications/WasteReminderLocalStorage', () => ({
  WASTE_REMINDER_LOCAL_STORAGE_KEY: 'WASTE_REMINDER_LOCAL_STATE',
  WASTE_REMINDER_SCHEDULING_ERROR_CLASSES: [
    'permission-denied',
    'channel-unavailable',
    'native-schedule-error',
    'native-verification-error',
    'native-verification-mismatch',
    'storage-error',
    'unknown'
  ],
  WASTE_REMINDER_SCHEDULING_REASONS: [
    'has-reminders',
    'no-active-types',
    'no-matching-waste-types',
    'no-pickup-dates',
    'no-future-reminders',
    'data-unavailable'
  ],
  WASTE_REMINDER_SCHEDULING_STATUSES: [
    'scheduled',
    'permission-required',
    'failed',
    'no-future-reminders',
    'inactive',
    'waiting-for-data'
  ],
  getWasteReminderOwnerKeyForToken: jest.fn()
}));
const permission = (status = 'granted') => ({
  status,
  granted: status === 'granted',
  canAskAgain: status !== 'denied',
  expires: 'never'
});

describe('collectWastePushDiagnostics', () => {
  const originalPlatform = Platform.OS;

  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(Platform, 'OS', { configurable: true, value: originalPlatform });
    [
      Notifications.getPermissionsAsync,
      Location.getForegroundPermissionsAsync,
      Location.getBackgroundPermissionsAsync,
      Camera.getCameraPermissionsAsync,
      Camera.getMicrophonePermissionsAsync,
      MediaLibrary.getPermissionsAsync,
      Calendar.getCalendarPermissionsAsync,
      Calendar.getRemindersPermissionsAsync
    ].forEach((getter) => (getter as jest.Mock).mockResolvedValue(permission()));
    (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue(undefined);
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      {
        identifier: 'private-id',
        content: {
          title: 'private-title',
          body: 'private-street',
          data: {
            pickupDates: ['2026-08-05'],
            query_type: 'WasteAddresses',
            reminderKey: 'private-reminder-key',
            wasteTypes: ['bio']
          }
        },
        trigger: { date: new Date('2026-08-03T08:00:00.000Z'), type: 'date' }
      },
      { identifier: 'other-id', content: { body: 'other-private', data: {} } }
    ]);
    (getInAppPermission as jest.Mock).mockResolvedValue(true);
    (getPushTokenFromStorage as jest.Mock).mockResolvedValue('private-token');
    (getWasteReminderOwnerKeyForToken as jest.Mock).mockReturnValue('owner-current');
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ownerKey: 'owner-current',
        scheduledNotificationIds: ['private-id'],
        scheduledReminderKeys: ['private-reminder-key'],
        scheduling: {
          actualCount: 1,
          attemptCount: 1,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T12:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: {
          activeReminderRegistrations: [
            {
              active: true,
              leadDays: 1,
              slotId: 'morning',
              storeId: 12,
              time: '09:00',
              typeKey: 'paper'
            }
          ],
          locationData: { city: 'Private City', street: 'private-street', zip: '12345' },
          notificationSettings: { paper: true },
          reminderTime: '2026-01-01',
          usedTypeKeys: ['paper']
        }
      })
    );
  });

  it('collects passive status and only a count from scheduled notifications', async () => {
    const result = await collectWastePushDiagnostics();
    const serialized = JSON.stringify(result);

    expect(result.permissions.notifications).toMatchObject({ status: 'granted', granted: true });
    expect(result.permissions.locationForeground).toMatchObject({ status: 'granted' });
    expect(result.scheduling.currentNativeInventory).toEqual({
      scheduledReminders: [
        {
          pickupDates: ['2026-08-05'],
          reminderAt: '2026-08-03T08:00:00.000Z',
          wasteTypeKeys: ['bio']
        }
      ],
      scheduledWasteNotificationCount: 1
    });
    expect(result.wasteConfiguration.location).toEqual({
      city: 'Private City',
      street: 'private-street',
      zip: '12345'
    });
    expect(result.wasteConfiguration.wastePushEnabled).toBe(true);
    expect(result.scheduling.lastSchedulingAttempt).toMatchObject({
      calculatedCount: 1,
      verifiedScheduledCount: 1,
      status: 'scheduled'
    });
    expect(result.push.token).toEqual({
      present: true,
      ownerState: 'matches-current-token'
    });
    expect(getWasteReminderOwnerKeyForToken).toHaveBeenCalledWith('private-token');
    ['private-token', 'private-title', 'private-id', 'private-reminder-key'].forEach((value) =>
      expect(serialized).not.toContain(value)
    );
    expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    expect(Location.requestForegroundPermissionsAsync).not.toHaveBeenCalled();
    expect(Camera.requestCameraPermissionsAsync).not.toHaveBeenCalled();
  });

  it('reports the waste-area master push switch as disabled when no waste type is enabled', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        serverSyncPayload: {
          activeTypes: { paper: { active: true } },
          notificationSettings: { bio: false, paper: false },
          reminderTime: '2026-01-01',
          usedTypeKeys: ['bio', 'paper']
        }
      })
    );

    const result = await collectWastePushDiagnostics();

    expect(result.wasteConfiguration).toMatchObject({
      enabledTypeKeys: [],
      wastePushEnabled: false
    });
  });

  it('treats omitted settings for non-push waste types as disabled', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ownerKey: 'owner-current',
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        serverSyncPayload: {
          activeTypes: {
            biocleaning: { active: true },
            paper: { active: true }
          },
          notificationSettings: { paper: true },
          reminderTime: '2026-01-01',
          usedTypeKeys: ['biocleaning', 'paper']
        }
      })
    );

    const result = await collectWastePushDiagnostics();

    expect(result.wasteConfiguration).toMatchObject({
      enabledTypeKeys: ['paper'],
      localStateStatus: 'valid',
      usedTypeKeys: ['biocleaning', 'paper'],
      wastePushEnabled: true
    });
    expect(result.push.token).toEqual({
      present: true,
      ownerState: 'matches-current-token'
    });
  });

  it('matches the scheduler waste predicate for empty and truthy non-string reminder keys', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([
      {
        identifier: 'empty-key',
        content: { data: { query_type: 'WasteAddresses', reminderKey: '' } }
      },
      {
        identifier: 'truthy-non-string-key',
        content: { data: { query_type: 'WasteAddresses', reminderKey: 7 } }
      }
    ]);

    const result = await collectWastePushDiagnostics();

    expect(result.scheduling.currentNativeInventory).toMatchObject({
      scheduledWasteNotificationCount: 1
    });
  });

  it('isolates a denied and a rejecting permission getter', async () => {
    (Location.getBackgroundPermissionsAsync as jest.Mock).mockResolvedValue(permission('denied'));
    (Camera.getMicrophonePermissionsAsync as jest.Mock).mockRejectedValue(new Error('unavailable'));

    const result = await collectWastePushDiagnostics();

    expect(result.permissions.locationBackground).toMatchObject({
      status: 'denied',
      granted: false
    });
    expect(result.permissions.locationForeground).toMatchObject({ status: 'granted' });
    expect(result.collectionStatus.permissions).toBe('failed');
  });

  it('keeps allowlisted Android notification metadata and channel state', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      ...permission(),
      android: { importance: 0, interruptionFilter: 2 }
    });
    (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue({
      importance: 0,
      enableVibrate: false,
      bypassDnd: false,
      sound: null
    });

    const result = await collectWastePushDiagnostics();

    expect(result.permissions.notifications.platformDetails).toEqual({
      importance: 0,
      interruptionFilter: 2
    });
    expect(result.push.defaultChannel).toEqual({
      exists: true,
      importance: 0,
      enableVibrate: false,
      bypassDnd: false,
      soundConfigured: false
    });
    expect(result.permissions.reminders).toEqual({ status: 'unavailable', granted: false });
  });

  it('reports a missing Android channel without treating it as a collector failure', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    (Notifications.getNotificationChannelAsync as jest.Mock).mockResolvedValue(null);

    const result = await collectWastePushDiagnostics();

    expect(result.push.defaultChannel).toEqual({ exists: false });
    expect(result.collectionStatus.androidPushChannel).toBeUndefined();
  });

  it('keeps allowlisted iOS notification metadata and does not query a channel', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'ios' });
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
      ...permission(),
      ios: {
        status: 3,
        allowsAlert: true,
        allowsBadge: false,
        allowsSound: true,
        allowsDisplayOnLockScreen: false,
        allowsDisplayInNotificationCenter: true,
        alertStyle: 1
      }
    });

    const result = await collectWastePushDiagnostics();

    expect(result.permissions.notifications.platformDetails).toEqual({
      authorizationStatus: 3,
      alert: true,
      badge: false,
      sound: true,
      lockScreen: false,
      notificationCenter: true,
      banner: 1
    });
    expect(Notifications.getNotificationChannelAsync).not.toHaveBeenCalled();
    expect(result.collectionStatus.androidPushChannel).toBeUndefined();
    expect(result.collectionStatus.pushSettings).toBeUndefined();
  });

  it('isolates scheduled-store failure from all other sections', async () => {
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockRejectedValue(
      new Error('native store unavailable')
    );

    const result = await collectWastePushDiagnostics();

    expect(result.collectionStatus.scheduledStore).toBe('failed');
    expect(result.permissions.locationForeground).toMatchObject({ status: 'granted' });
    expect(result.push.inAppEnabled).toBe(true);
  });

  it.each([
    ['inAppPushSetting', getInAppPermission],
    ['tokenOwner', getPushTokenFromStorage]
  ])('isolates a %s section failure', async (statusKey, getter) => {
    (getter as jest.Mock).mockRejectedValue(new Error('section unavailable'));

    const result = await collectWastePushDiagnostics();

    expect(result.collectionStatus[statusKey]).toBe('failed');
    expect(result.permissions.locationForeground).toMatchObject({ status: 'granted' });
    expect(result.scheduling.currentNativeInventory).toMatchObject({
      scheduledWasteNotificationCount: 1
    });
  });

  it('reports Android channel collection failures under the Android-only status key', async () => {
    Object.defineProperty(Platform, 'OS', { configurable: true, value: 'android' });
    (Notifications.getNotificationChannelAsync as jest.Mock).mockRejectedValue(
      new Error('channel unavailable')
    );

    const result = await collectWastePushDiagnostics();

    expect(result.collectionStatus.androidPushChannel).toBe('failed');
    expect(result.collectionStatus.pushSettings).toBeUndefined();
  });

  it('isolates local state failure from all other sections', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('storage unavailable'));

    const result = await collectWastePushDiagnostics();

    expect(result.collectionStatus.wasteState).toBe('failed');
    expect(result.permissions.locationForeground).toMatchObject({ status: 'granted' });
    expect(result.scheduling.currentNativeInventory).toMatchObject({
      scheduledWasteNotificationCount: 1
    });
  });

  it('rejects an oversized but valid diagnostic object', async () => {
    const usedTypeKeys = Array.from(
      { length: 200 },
      (_, index) => `type-${index}-${'x'.repeat(85)}`
    );
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ownerKey: 'owner-current',
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        serverSyncPayload: {
          notificationSettings: Object.fromEntries(usedTypeKeys.map((key) => [key, true])),
          reminderTime: '2026-01-01',
          usedTypeKeys
        }
      })
    );

    await expect(collectWastePushDiagnostics()).rejects.toThrow('exceed the allowed payload size');
  });

  it('reports corrupt local state without deleting it', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('{');

    const result = await collectWastePushDiagnostics();

    expect(result.wasteConfiguration.localStateStatus).toBe('corrupt');
    expect(AsyncStorage.removeItem).toBeUndefined();
  });

  it('reports missing local state and preserves token presence', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const result = await collectWastePushDiagnostics();

    expect(result.wasteConfiguration.localStateStatus).toBe('missing');
    expect(result.push.token).toEqual({ present: true, ownerState: 'no-local-state' });
  });

  it('allowlists persisted scheduling fields before adding them to the report', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ownerKey: 'persisted-private-owner',
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        scheduling: {
          actualCount: 1,
          attemptCount: 1,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T12:00:00.000Z',
          status: 'scheduled',
          token: 'persisted-private-token',
          locationData: { street: 'Persisted Private Street' },
          error: { secret: 'persisted-private-error-secret' }
        }
      })
    );

    const serialized = JSON.stringify(await collectWastePushDiagnostics());

    [
      'persisted-private-token',
      'persisted-private-owner',
      'Persisted Private Street',
      'persisted-private-error-secret'
    ].forEach((fixture) => expect(serialized).not.toContain(fixture));
    expect(serialized).toContain('"status":"scheduled"');
  });

  it('treats malformed secret-bearing configuration primitives as corrupt', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(
      JSON.stringify({
        ownerKey: 'persisted-private-owner',
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        serverSyncStatus: { secret: 'nested-private-sync-status' },
        serverSyncPayload: {
          usedTypeKeys: [{ token: 'nested-private-type-token' }],
          notificationSettings: {
            paper: { authorization: 'nested-private-setting-authorization' }
          },
          activeReminderRegistrations: [
            {
              active: true,
              leadDays: { secret: 'nested-private-lead-days' },
              slotId: { secret: 'nested-private-slot' },
              time: { secret: 'nested-private-time' },
              typeKey: { secret: 'nested-private-type' }
            }
          ],
          locationData: {
            street: { secret: 'nested-private-street' }
          }
        }
      })
    );

    const result = await collectWastePushDiagnostics();
    const serialized = JSON.stringify(result);

    expect(result.wasteConfiguration.localStateStatus).toBe('corrupt');
    expect(result.wasteConfiguration).toEqual({ localStateStatus: 'corrupt' });
    [
      'nested-private-type-token',
      'nested-private-sync-status',
      'nested-private-setting-authorization',
      'nested-private-lead-days',
      'nested-private-slot',
      'nested-private-time',
      'nested-private-type',
      'nested-private-street'
    ].forEach((fixture) => expect(serialized).not.toContain(fixture));
    expect(AsyncStorage.removeItem).toBeUndefined();
  });
});
