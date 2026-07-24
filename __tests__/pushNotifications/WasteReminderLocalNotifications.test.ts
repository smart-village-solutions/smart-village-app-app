import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as SecureStore from 'expo-secure-store';

import {
  clearWasteReminderLocalNotifications,
  clearWasteReminderLocalStateForChangedOwner,
  rescheduleWasteReminderNotificationsFromLocalState,
  retryPendingWasteReminderNotificationCancellations,
  scheduleWasteReminderNotifications,
  storeWasteReminderSettingsWithoutScheduling,
  verifyWasteReminderNotificationsFromLocalState
} from '../../src/pushNotifications/WasteReminderLocalNotifications';
import {
  WASTE_REMINDER_LOCAL_STORAGE_KEY,
  WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY,
  markWasteReminderServerSyncSynced,
  readWasteReminderLocalState
} from '../../src/pushNotifications/WasteReminderLocalStorage';
import type { WasteReminderServerSyncPayload } from '../../src/pushNotifications/WasteReminderLocalStorage';
import type { WasteReminderOccurrence } from '../../src/pushNotifications/WasteReminderScheduler';
import { reportWasteReminderSchedulingTransition } from '../../src/pushNotifications/WasteReminderDiagnostics';

let mockScheduledNotifications: Array<{
  content: { data: { query_type: string; reminderKey: string } };
  identifier: string;
}> = [];

jest.mock('expo-notifications', () => ({
  AndroidImportance: { DEFAULT: 'default' },
  IosAuthorizationStatus: { PROVISIONAL: 3 },
  SchedulableTriggerInputTypes: { DATE: 'date', TIME_INTERVAL: 'timeInterval' },
  cancelScheduledNotificationAsync: jest.fn(async (identifier) => {
    mockScheduledNotifications = mockScheduledNotifications.filter(
      (notification) => notification.identifier !== identifier
    );
  }),
  getAllScheduledNotificationsAsync: jest.fn(async () => mockScheduledNotifications),
  getPermissionsAsync: jest.fn(async () => ({ granted: true, status: 'granted' })),
  scheduleNotificationAsync: jest.fn(async ({ content }) => {
    const identifier = `scheduled-${content.data.reminderKey}`;
    mockScheduledNotifications.push({ content, identifier });
    return identifier;
  }),
  setNotificationChannelAsync: jest.fn(async () => undefined)
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async () => 'access-token')
}));

jest.mock('../../src/pushNotifications/WasteReminderDiagnostics', () => ({
  ...jest.requireActual('../../src/pushNotifications/WasteReminderDiagnostics'),
  reportWasteReminderSchedulingTransition: jest.fn()
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
    mockScheduledNotifications = [];
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

  it('persists failed cancellation ids and retries them with the next replacement', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        serverSyncStatus: 'synced'
      })
    );
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('cancel failed')
    );

    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(
      JSON.parse(
        (await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY)) || '[]'
      )
    ).toEqual(['old-1']);

    await scheduleWasteReminderNotifications({
      reminders: [createReminder({ id: 'waste:key-2' })],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('old-1');
    expect(await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY)).toBeNull();
  });

  it('retains failed cancellation ids when reminders become inactive', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        serverSyncStatus: 'synced'
      })
    );
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('cancel failed')
    );

    await scheduleWasteReminderNotifications({
      reminders: [],
      scheduleReason: 'no-active-types',
      serverSyncPayload: createServerSyncPayload()
    });

    expect((await parseStoredReminderState()).scheduling.status).toBe('inactive');
    expect(
      JSON.parse(
        (await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY)) || '[]'
      )
    ).toEqual(['old-1']);
  });

  it('preserves pending cancellation ids when replacement scheduling fails', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY,
      JSON.stringify(['orphan-1'])
    );
    (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('schedule failed')
    );
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('cancel still failing')
    );

    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(
      JSON.parse(
        (await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY)) || '[]'
      )
    ).toEqual(['orphan-1']);
  });

  it('serializes concurrent retries of pending notification cancellations', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY,
      JSON.stringify(['orphan-1'])
    );
    let rejectFirstCancellation: (error: Error) => void = () => undefined;
    (Notifications.cancelScheduledNotificationAsync as jest.Mock)
      .mockImplementationOnce(
        () =>
          new Promise((_, reject) => {
            rejectFirstCancellation = reject;
          })
      )
      .mockResolvedValueOnce(undefined);

    const firstRetry = retryPendingWasteReminderNotificationCancellations();
    const secondRetry = retryPendingWasteReminderNotificationCancellations();
    await new Promise((resolve) => setImmediate(resolve));

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(1);

    rejectFirstCancellation(new Error('cancel failed'));
    await firstRetry;
    await secondRetry;

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledTimes(2);
    expect(await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY)).toBeNull();
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

  it('reads coverage reminder copy from texts', async () => {
    jest.resetModules();
    jest.clearAllMocks();

    const customTexts = {
      wasteCalendar: {
        localReminderCoverageNotificationBody: 'Custom coverage body',
        localReminderCoverageNotificationTitle: 'Custom coverage title',
        localReminderNotificationTitle: 'Custom pickup title'
      }
    };

    jest.doMock('../../src/config', () => ({
      texts: customTexts
    }));

    /* eslint-disable @typescript-eslint/no-var-requires */
    const FreshNotifications = require('expo-notifications');
    const {
      scheduleWasteReminderNotifications: scheduleNotificationsWithMockedTexts
    } = require('../../src/pushNotifications/WasteReminderLocalNotifications');
    /* eslint-enable @typescript-eslint/no-var-requires */

    await scheduleNotificationsWithMockedTexts({
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

    expect(FreshNotifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        content: expect.objectContaining({
          title: 'Custom pickup title'
        })
      })
    );
    expect(FreshNotifications.scheduleNotificationAsync).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        content: expect.objectContaining({
          body: 'Custom coverage body',
          title: 'Custom coverage title'
        })
      })
    );
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

  it('stores pending settings and classified health if local scheduling fails', async () => {
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
    ).resolves.toEqual({ errorClass: 'native-schedule-error', status: 'failed' });

    const storedState = await parseStoredReminderState();
    expect(storedState.scheduling).toEqual(
      expect.objectContaining({
        attemptCount: 1,
        errorClass: 'native-schedule-error',
        expectedCount: 1,
        status: 'failed'
      })
    );
    expect(storedState.serverSyncPayload.notificationSettings).toEqual({ paper: true });
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
    ).resolves.toEqual({ errorClass: 'native-schedule-error', status: 'failed' });

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-1');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-2');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('new-1');

    const storedState = await parseStoredReminderState();

    expect(storedState.scheduledNotificationIds).toEqual(['old-1', 'old-2']);
    expect(storedState.serverSyncStatus).toBe('pending');
    expect(storedState.scheduling.errorClass).toBe('native-schedule-error');
  });

  it('preserves old reminders when native verification finds no new registrations', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        serverSyncStatus: 'synced'
      })
    );
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValueOnce([]);

    await expect(
      scheduleWasteReminderNotifications({
        reminders: [createReminder()],
        serverSyncPayload: createServerSyncPayload()
      })
    ).resolves.toEqual({
      errorClass: 'native-verification-mismatch',
      status: 'failed'
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'scheduled-waste:key-1'
    );
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-1');
    expect((await parseStoredReminderState()).scheduledNotificationIds).toEqual(['old-1']);
  });

  it('does not cancel old reminders when persisting a verified replacement fails', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        serverSyncStatus: 'synced'
      })
    );
    (AsyncStorage.setItem as jest.Mock).mockRejectedValueOnce(new Error('storage unavailable'));

    await expect(
      scheduleWasteReminderNotifications({
        reminders: [createReminder()],
        serverSyncPayload: createServerSyncPayload()
      })
    ).resolves.toEqual({ errorClass: 'storage-error', status: 'failed' });

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith('old-1');
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'scheduled-waste:key-1'
    );
    const storedState = await parseStoredReminderState();
    expect(storedState.scheduledNotificationIds).toEqual(['old-1']);
    expect(storedState.scheduling.errorClass).toBe('storage-error');
  });

  it('keeps a verified replacement when only cleanup queue persistence fails', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        serverSyncStatus: 'synced'
      })
    );
    (AsyncStorage.removeItem as jest.Mock).mockRejectedValueOnce(
      new Error('cleanup storage unavailable')
    );

    await expect(
      scheduleWasteReminderNotifications({
        reminders: [createReminder()],
        serverSyncPayload: createServerSyncPayload()
      })
    ).resolves.toEqual({ actualCount: 1, expectedCount: 1, status: 'scheduled' });

    expect((await parseStoredReminderState()).scheduledNotificationIds).toEqual([
      'scheduled-waste:key-1'
    ]);
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalledWith(
      'scheduled-waste:key-1'
    );
  });

  it('persists a classified failure when native availability lookup rejects', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('permission lookup failed')
    );

    await expect(
      scheduleWasteReminderNotifications({
        reminders: [createReminder()],
        serverSyncPayload: createServerSyncPayload()
      })
    ).resolves.toEqual({ errorClass: 'native-schedule-error', status: 'failed' });

    expect((await parseStoredReminderState()).scheduling.status).toBe('failed');
  });

  it('persists permission-required without scheduling or removing old reminders', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key']
      })
    );
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
      status: 'denied'
    });

    await expect(
      scheduleWasteReminderNotifications({
        reminders: [createReminder()],
        serverSyncPayload: createServerSyncPayload()
      })
    ).resolves.toEqual({ status: 'permission-required' });

    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    const storedState = await parseStoredReminderState();
    expect(storedState.scheduledNotificationIds).toEqual(['old-1']);
    expect(storedState.scheduling.status).toBe('permission-required');
  });

  it('reports recovery when scheduling succeeds after permission-required', async () => {
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
      status: 'denied'
    });
    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });
    (reportWasteReminderSchedulingTransition as jest.Mock).mockClear();

    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(reportWasteReminderSchedulingTransition).toHaveBeenCalledWith(
      expect.objectContaining({ schedulingStatus: 'scheduled' })
    );
  });

  it('throttles foreground verification for a recently verified schedule', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        scheduling: {
          actualCount: 1,
          attemptCount: 0,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T10:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: createServerSyncPayload()
      })
    );

    await expect(
      verifyWasteReminderNotificationsFromLocalState({
        now: new Date('2026-07-23T11:00:00.000Z')
      })
    ).resolves.toEqual({ checked: false, status: 'scheduled' });
    expect(Notifications.getAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('persists a failure when foreground availability lookup rejects', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        scheduling: {
          attemptCount: 0,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T10:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: createServerSyncPayload()
      })
    );
    (Notifications.getPermissionsAsync as jest.Mock).mockRejectedValueOnce(
      new Error('permission lookup failed')
    );

    await expect(verifyWasteReminderNotificationsFromLocalState()).resolves.toEqual({
      checked: true,
      errorClass: 'native-verification-error',
      status: 'failed'
    });
    expect((await parseStoredReminderState()).scheduling.status).toBe('failed');
  });

  it('verifies a stale complete native inventory without replacing it', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        scheduling: {
          attemptCount: 0,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T01:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: createServerSyncPayload()
      })
    );
    mockScheduledNotifications = [
      {
        content: { data: { query_type: 'WasteAddresses', reminderKey: 'old-key' } },
        identifier: 'old-1'
      }
    ];

    await expect(
      verifyWasteReminderNotificationsFromLocalState({
        now: new Date('2026-07-23T10:00:00.000Z')
      })
    ).resolves.toEqual({ checked: true, status: 'scheduled' });
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    expect((await parseStoredReminderState()).scheduling.actualCount).toBe(1);
  });

  it('classifies a stale missing native inventory for one replacement attempt', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        scheduling: {
          attemptCount: 0,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T01:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: createServerSyncPayload()
      })
    );

    await expect(
      verifyWasteReminderNotificationsFromLocalState({
        now: new Date('2026-07-23T10:00:00.000Z')
      })
    ).resolves.toEqual({
      checked: true,
      errorClass: 'native-verification-mismatch',
      status: 'failed'
    });
    expect((await parseStoredReminderState()).scheduling.attemptCount).toBe(1);
  });

  it('detects foreground permission denial before the verification throttle', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        scheduling: {
          attemptCount: 0,
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T10:00:00.000Z',
          status: 'scheduled'
        },
        serverSyncPayload: createServerSyncPayload()
      })
    );
    (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValueOnce({
      granted: false,
      status: 'denied'
    });

    await expect(
      verifyWasteReminderNotificationsFromLocalState({
        now: new Date('2026-07-23T11:00:00.000Z')
      })
    ).resolves.toEqual({ checked: true, status: 'permission-required' });
    expect(Notifications.getAllScheduledNotificationsAsync).not.toHaveBeenCalled();
    expect((await parseStoredReminderState()).scheduling.status).toBe('permission-required');
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

    await expect(clearWasteReminderLocalStateForChangedOwner()).resolves.toBe(
      'changed-and-cleared'
    );
    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith(
      'scheduled-waste:key-1'
    );
    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).toBeNull();
  });

  it('clears changed-owner state even when native notification cleanup fails', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        ownerKey: 'push:old-owner',
        scheduledNotificationIds: ['old-1'],
        scheduledReminderKeys: ['old-key'],
        serverSyncPayload: createServerSyncPayload()
      })
    );
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('different-push-token');
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockRejectedValueOnce(
      new Error('cancel failed')
    );

    await expect(clearWasteReminderLocalStateForChangedOwner()).resolves.toBe(
      'changed-and-cleared'
    );
    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).toBeNull();
    expect(
      JSON.parse(
        (await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY)) || '[]'
      )
    ).toEqual(['old-1']);
  });

  it('does not report the same scheduling failure state more than once', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        scheduling: {
          attemptCount: 1,
          errorClass: 'native-schedule-error',
          expectedCount: 1,
          lastAttemptAt: '2026-07-23T10:00:00.000Z',
          status: 'failed'
        },
        serverSyncPayload: createServerSyncPayload()
      })
    );
    (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
      new Error('schedule failed')
    );

    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });

    expect(reportWasteReminderSchedulingTransition).not.toHaveBeenCalled();
  });

  it('keeps local waste reminder state when the current push token is temporarily unavailable', async () => {
    await scheduleWasteReminderNotifications({
      reminders: [createReminder()],
      serverSyncPayload: createServerSyncPayload()
    });

    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(undefined);

    await expect(clearWasteReminderLocalStateForChangedOwner()).resolves.toBe('unchanged');
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    expect(await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY)).not.toBeNull();
  });

  it('keeps anonymous reminder configuration when a push token becomes available later', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        ownerKey: 'anonymous',
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        serverSyncPayload: createServerSyncPayload(),
        serverSyncStatus: 'pending'
      })
    );
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('new-push-token');

    await expect(clearWasteReminderLocalStateForChangedOwner()).resolves.toBe('adopted-anonymous');

    const storedState = await parseStoredReminderState();

    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    expect(storedState.serverSyncPayload).toBeDefined();
    expect(storedState.ownerKey).not.toBe('anonymous');
  });

  it('clears locally scheduled waste reminders and keeps reminder configuration on push opt-out', async () => {
    const serverSyncPayload = createServerSyncPayload({
      activeReminderRegistrations: [
        {
          active: true,
          leadDays: 2,
          slotId: 'first',
          time: '11:30',
          typeKey: 'paper'
        }
      ]
    });

    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['stored-pickup', 'stored-coverage'],
        scheduledReminderKeys: ['waste:key-1'],
        serverSyncPayload,
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

    const storedState = await parseStoredReminderState();

    expect(storedState.scheduledNotificationIds).toEqual([]);
    expect(storedState.scheduledReminderKeys).toEqual([]);
    expect(storedState.scheduledCoverageReminderNotificationIds).toEqual([]);
    expect(storedState.serverSyncPayload).toEqual({
      ...serverSyncPayload,
      reminderTime: serverSyncPayload.reminderTime.toISOString()
    });
    expect(storedState.serverSyncStatus).toBe('synced');
  });

  it('stores reminder configuration without scheduled notification ids while global push is disabled', async () => {
    await AsyncStorage.setItem(
      WASTE_REMINDER_LOCAL_STORAGE_KEY,
      JSON.stringify({
        scheduledNotificationIds: ['stored-pickup'],
        scheduledReminderKeys: ['waste:key-1'],
        serverSyncPayload: createServerSyncPayload({ notificationSettings: { paper: false } }),
        serverSyncStatus: 'synced'
      })
    );

    const serverSyncPayload = createServerSyncPayload({
      activeReminderRegistrations: [
        {
          active: true,
          leadDays: 2,
          slotId: 'first',
          time: '11:30',
          typeKey: 'paper'
        }
      ]
    });

    await storeWasteReminderSettingsWithoutScheduling(serverSyncPayload);

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('stored-pickup');

    const storedState = await parseStoredReminderState();

    expect(storedState.scheduledNotificationIds).toEqual([]);
    expect(storedState.scheduledReminderKeys).toEqual([]);
    expect(storedState.scheduledCoverageReminderNotificationIds).toEqual([]);
    expect(storedState.serverSyncPayload).toEqual({
      ...serverSyncPayload,
      reminderTime: serverSyncPayload.reminderTime.toISOString()
    });
    expect(storedState.serverSyncStatus).toBe('pending');
  });
});
