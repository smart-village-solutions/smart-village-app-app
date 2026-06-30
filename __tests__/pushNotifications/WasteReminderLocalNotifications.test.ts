import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import {
  clearWasteReminderLocalNotifications,
  clearWasteReminderLocalStateForChangedOwner,
  rescheduleWasteReminderNotificationsFromLocalState,
  scheduleWasteReminderNotifications
} from '../../src/pushNotifications/WasteReminderLocalNotifications';
import {
  WASTE_REMINDER_LOCAL_STORAGE_KEY,
  markWasteReminderServerSyncSynced,
  readWasteReminderLocalState
} from '../../src/pushNotifications/WasteReminderLocalStorage';
import type { WasteReminderServerSyncPayload } from '../../src/pushNotifications/WasteReminderLocalStorage';
import type { WasteReminderOccurrence } from '../../src/pushNotifications/WasteReminderScheduler';

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 'default' },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  cancelScheduledNotificationAsync: jest.fn(async () => undefined),
  getAllScheduledNotificationsAsync: jest.fn(async () => []),
  scheduleNotificationAsync: jest.fn(
    async ({ content }) => `scheduled-${content.data.reminderKey}`
  ),
  setNotificationChannelAsync: jest.fn(async () => undefined)
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'access-token')
}));

jest.mock('../../src/pushNotifications/TokenHandling', () => ({
  PushNotificationStorageKeys: { ACCESS_TOKEN: 'ACCESS_TOKEN', PUSH_TOKEN: 'PUSH_TOKEN' }
}));

const createReminder = (
  overrides: Partial<WasteReminderOccurrence> = {}
): WasteReminderOccurrence => ({
  id: 'waste:key-1',
  pickupDates: ['2026-06-10'],
  reminderAt: new Date('2026-06-09T09:00:00.000+02:00'),
  wasteTypes: ['paper'],
  ...overrides
});

const createServerSyncPayload = (
  overrides: Partial<WasteReminderServerSyncPayload> = {}
): WasteReminderServerSyncPayload => ({
  activeTypes: { paper: { active: true, storeId: 12 } },
  locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
  notificationSettings: { paper: true },
  onDayBefore: true,
  reminderTime: new Date('2000-01-01T09:00:00.000+01:00'),
  usedTypeKeys: ['paper'],
  ...overrides
});

const paperWasteTypesData = {
  paper: { color: '#000', icon: 'paper', label: 'Papier', selected_color: '#111' }
};

const parseStoredReminderState = async () =>
  JSON.parse((await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)) || '{}');

describe('scheduleWasteReminderNotifications', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('access-token');
    await AsyncStorage.clear();
  });

  it('cancels previous local waste reminders before scheduling replacements', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1', 'old-2'],
        serverSyncStatus: 'synced'
      })
    );

    await scheduleWasteReminderNotifications({
      localCoverageUntil: new Date('2026-06-09T09:00:00.000+02:00'),
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload(),
      streetName: 'Test Street',
      wasteTypesData: paperWasteTypesData
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-2');
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          body: 'Test Street: Am 10.06.2026 wird Papier abgeholt.',
          data: expect.objectContaining({
            pickupDates: ['2026-06-10']
          })
        })
      })
    );

    const storedState = await parseStoredReminderState();

    expect(storedState.scheduledNotificationIds).toEqual(['scheduled-waste:key-1']);
    expect(storedState.scheduledReminderKeys).toEqual(['waste:key-1']);
    expect(storedState.ownerKey).toBeDefined();
    expect(storedState.serverSyncStatus).toBe('pending');
  });

  it('schedules app-open sync reminders when local reminders do not cover all known pickups', async () => {
    await scheduleWasteReminderNotifications({
      hasMoreReminders: true,
      localCoverageUntil: new Date('2026-08-31T09:00:00.000+02:00'),
      now: new Date('2026-07-01T08:00:00.000+02:00'),
      reminders: [
        createReminder({
          pickupDates: ['2026-08-31'],
          reminderAt: new Date('2026-08-31T09:00:00.000+02:00')
        })
      ],
      serverSyncPayload: createServerSyncPayload(),
      streetName: 'Test Street',
      wasteTypesData: paperWasteTypesData
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(3);
    expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        content: expect.objectContaining({
          body: 'Bitte öffne die App, um Abfalltermine und Erinnerungen zu synchronisieren.',
          data: expect.objectContaining({
            query_type: 'WasteAddresses',
            reminderKey: 'waste-sync:one-month-before'
          }),
          title: 'Abfallkalender aktualisieren'
        }),
        trigger: expect.objectContaining({
          date: new Date('2026-07-31T09:00:00.000+02:00')
        })
      })
    );
    expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        content: expect.objectContaining({
          data: expect.objectContaining({
            reminderKey: 'waste-sync:one-week-before'
          })
        }),
        trigger: expect.objectContaining({
          date: new Date('2026-08-24T09:00:00.000+02:00')
        })
      })
    );

    const storedState = await parseStoredReminderState();

    expect(storedState.scheduledNotificationIds).toEqual([
      'scheduled-waste:key-1',
      'scheduled-waste-sync:one-month-before',
      'scheduled-waste-sync:one-week-before'
    ]);
    expect(storedState.scheduledCoverageReminderNotificationIds).toEqual([
      'scheduled-waste-sync:one-month-before',
      'scheduled-waste-sync:one-week-before'
    ]);
    expect(storedState.scheduledReminderKeys).toEqual(['waste:key-1']);
  });

  it('clamps the one-month coverage reminder to the previous month when day would overflow', async () => {
    await scheduleWasteReminderNotifications({
      hasMoreReminders: true,
      localCoverageUntil: new Date('2026-03-31T09:00:00.000+02:00'),
      now: new Date('2026-02-01T08:00:00.000+01:00'),
      reminders: [
        createReminder({
          pickupDates: ['2026-03-31'],
          reminderAt: new Date('2026-03-31T09:00:00.000+02:00')
        })
      ],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        trigger: expect.objectContaining({
          date: new Date('2026-02-28T09:00:00.000+01:00')
        })
      })
    );
  });

  it('does not schedule app-open sync reminders when all known pickups fit locally', async () => {
    await scheduleWasteReminderNotifications({
      hasMoreReminders: false,
      localCoverageUntil: new Date('2026-08-31T09:00:00.000+02:00'),
      now: new Date('2026-07-01T08:00:00.000+02:00'),
      reminders: [
        createReminder({
          pickupDates: ['2026-08-31'],
          reminderAt: new Date('2026-08-31T09:00:00.000+02:00')
        })
      ],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
  });

  it('replaces old app-open sync reminders when local reminders are refreshed on app open', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        localCoverageUntil: '2026-08-31T07:00:00.000Z',
        scheduledCoverageReminderNotificationIds: ['old-month', 'old-week'],
        scheduledNotificationIds: ['old-pickup', 'old-month', 'old-week'],
        scheduledReminderKeys: ['old-key'],
        serverSyncPayload: {
          activeReminderRegistrations: [
            { active: true, leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'paper' }
          ],
          activeTypes: { paper: { active: true, storeId: 12 } },
          locationData: { city: 'Berlin', street: 'Test Street', zip: '12345' },
          notificationSettings: { paper: true },
          reminderTime: '2000-01-01T08:00:00.000Z',
          usedTypeKeys: ['paper']
        },
        serverSyncStatus: 'synced'
      })
    );

    await rescheduleWasteReminderNotificationsFromLocalState({
      now: new Date('2026-07-01T08:00:00.000+02:00'),
      streetName: 'Test Street',
      wasteLocationTypes: [
        {
          wasteType: 'paper',
          pickUpTimes: Array.from({ length: 60 }, (_, index) => {
            const pickupDate = new Date('2026-08-01T00:00:00.000+02:00');
            pickupDate.setDate(pickupDate.getDate() + index);

            return { pickupDate: pickupDate.toISOString().slice(0, 10) };
          })
        }
      ],
      wasteTypesData: {
        paper: { color: '#000', icon: 'paper', label: 'Papier', selected_color: '#111' }
      }
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-pickup');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-month');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-week');

    const storedState = await parseStoredReminderState();

    expect(storedState.serverSyncStatus).toBe('synced');
    expect(storedState.scheduledCoverageReminderNotificationIds).toHaveLength(2);
    expect(storedState.scheduledNotificationIds).toContain(
      storedState.scheduledCoverageReminderNotificationIds[0]
    );
  });

  it('does not store pending server sync state if local scheduling fails', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('schedule failed')
    );

    await expect(
      scheduleWasteReminderNotifications({
        localCoverageUntil: new Date('2026-06-09T09:00:00.000+02:00'),
        reminders: [createReminder()],
        serverSyncPayload: createServerSyncPayload(),
        streetName: 'Test Street',
        wasteTypesData: paperWasteTypesData
      })
    ).rejects.toThrow('schedule failed');

    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('keeps previous local reminders when replacement scheduling fails', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1', 'old-2'],
        scheduledReminderKeys: ['old-key'],
        serverSyncStatus: 'synced'
      })
    );
    (Notifications.scheduleNotificationAsync as jest.Mock)
      .mockResolvedValueOnce('new-1')
      .mockRejectedValueOnce(new Error('schedule failed'));

    await expect(
      scheduleWasteReminderNotifications({
        reminders: [
          createReminder(),
          createReminder({
            id: 'waste:key-2',
            pickupDates: ['2026-06-11'],
            reminderAt: new Date('2026-06-10T09:00:00.000+02:00')
          })
        ],
        serverSyncPayload: createServerSyncPayload(),
        streetName: 'Test Street',
        wasteTypesData: paperWasteTypesData
      })
    ).rejects.toThrow('schedule failed');

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-1');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-2');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('new-1');

    const storedState = await parseStoredReminderState();

    expect(storedState.scheduledNotificationIds).toEqual(['old-1', 'old-2']);
    expect(storedState.serverSyncStatus).toBe('synced');
  });

  it('stores updated server sync payload when marking sync as complete', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        serverSyncPayload: {
          activeReminderRegistrations: [
            { active: true, leadDays: 1, slotId: 'first', time: '09:00', typeKey: 'paper' }
          ],
          activeTypes: {},
          notificationSettings: { paper: true },
          reminderTime: '2000-01-01T08:00:00.000Z',
          usedTypeKeys: ['paper']
        },
        serverSyncStatus: 'pending'
      })
    );

    await markWasteReminderServerSyncSynced({
      activeReminderRegistrations: [
        {
          active: true,
          leadDays: 1,
          slotId: 'first',
          storeId: 789,
          time: '09:00',
          typeKey: 'paper'
        }
      ],
      activeTypes: { paper: { active: true, storeId: 789 } },
      notificationSettings: { paper: true },
      reminderTime: '2000-01-01T08:00:00.000Z',
      usedTypeKeys: ['paper']
    });

    const storedState = await parseStoredReminderState();

    expect(storedState.serverSyncStatus).toBe('synced');
    expect(storedState.serverSyncPayload.activeReminderRegistrations[0].storeId).toBe(789);
  });

  it('ignores corrupt persisted local reminder state', async () => {
    await AsyncStorage.setItem(WASTE_REMINDER_LOCAL_STORAGE_KEY, '{broken json');

    await expect(readWasteReminderLocalState()).resolves.toBeUndefined();
    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('clears scheduled waste reminders when the stored owner differs from the current push token', async () => {
    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('different-push-token');

    await expect(clearWasteReminderLocalStateForChangedOwner()).resolves.toBe(true);
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'scheduled-waste:key-1'
    );
    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('clears locally scheduled waste reminders and removes local state on push opt-out', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['stored-pickup', 'stored-coverage'],
        scheduledReminderKeys: ['waste:key-1'],
        serverSyncStatus: 'synced'
      })
    );
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([
      {
        content: {
          data: {
            query_type: 'WasteAddresses',
            reminderKey: 'orphaned-waste:key-2'
          }
        },
        identifier: 'orphaned-waste'
      },
      {
        content: {
          data: {
            query_type: 'Other'
          }
        },
        identifier: 'other-notification'
      }
    ]);

    await clearWasteReminderLocalNotifications();

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('stored-pickup');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('stored-coverage');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('orphaned-waste');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith(
      'other-notification'
    );
    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).toBeNull();
  });
});
