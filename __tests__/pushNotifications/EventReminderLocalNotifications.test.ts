import * as Notifications from 'expo-notifications';

import {
  applyEventReminderUpdates,
  getEventRemindersEnabled,
  readEventReminders,
  refreshEventReminders,
  removeEventReminder,
  saveEventReminder
} from '../../src/pushNotifications/EventReminderLocalNotifications';
import {
  IOS_LOCAL_NOTIFICATION_BUDGET,
  registerEventReminderRestoration,
  releaseEventSlotsForWaste,
  runWasteNotificationUpdate
} from '../../src/pushNotifications/LocalNotificationCapacity';
import {
  getLocalNotificationPermission,
  requestLocalNotificationPermission
} from '../../src/pushNotifications/PermissionHandling';

jest.mock('../../src/config', () => ({
  texts: {
    eventReminders: { title: 'Veranstaltungserinnerungen', notificationTitle: 'Erinnerung' }
  }
}));

jest.mock('../../src/helpers/storageHelper', () => {
  let stored: string;
  return {
    addToStore: jest.fn(async (_key, value) => {
      stored = JSON.stringify(value);
    }),
    readFromStore: jest.fn(async () => (stored ? JSON.parse(stored) : null))
  };
});

jest.mock('../../src/pushNotifications/PermissionHandling', () => ({
  getLocalNotificationPermission: jest.fn(),
  requestLocalNotificationPermission: jest.fn()
}));

jest.mock('expo-notifications', () => ({
  getAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  SchedulableTriggerInputTypes: { DATE: 'date' }
}));

const venue = {
  eventId: 'e1',
  occurrenceId: 'd1',
  title: 'Bürgerfest',
  date: '2026-11-20',
  time: '19:00'
};
const rule = { kind: 'relative', leadDays: 3 } as const;

describe('event reminders scheduling', () => {
  let native: Map<string, Notifications.NotificationRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-01T09:00:00Z'));
    (getLocalNotificationPermission as jest.Mock).mockResolvedValue(true);
    (requestLocalNotificationPermission as jest.Mock).mockResolvedValue(true);
    native = new Map();
    (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockImplementation(async () => [
      ...native.values()
    ]);
    (Notifications.scheduleNotificationAsync as jest.Mock).mockImplementation(async (input) => {
      native.set(input.identifier, input);
      return input.identifier;
    });
    (Notifications.cancelScheduledNotificationAsync as jest.Mock).mockImplementation(async (id) => {
      native.delete(id);
    });
  });

  afterEach(async () => {
    const reminders = await readEventReminders();
    for (const { occurrence } of Object.values(reminders)) {
      await removeEventReminder(occurrence);
    }
    jest.restoreAllMocks();
  });

  it('requires explicit instance configuration', () => {
    expect(getEventRemindersEnabled({ settings: { pushNotifications: true } })).toBe(false);
    expect(
      getEventRemindersEnabled({ settings: { eventCalendar: { reminders: { enabled: true } } } })
    ).toBe(true);
  });

  it('confirms the native record and does not duplicate it on refresh', async () => {
    expect(await saveEventReminder(venue, rule)).toBe('scheduled');
    await refreshEventReminders();
    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledTimes(1);
    expect(native.get('event-reminder:e1:d1')?.content.data).toMatchObject({
      id: 'e1',
      occurrenceId: 'd1',
      reminderAt: Date.parse('2026-11-17T18:00:00Z')
    });
    await removeEventReminder(venue);
    expect(native.size).toBe(0);
    expect(await readEventReminders()).toEqual({});
  });

  it('does not report a native request as scheduled when the inventory does not confirm it', async () => {
    (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValueOnce('not-present');
    expect(await saveEventReminder(venue, rule)).toBe('failed');
    expect((await readEventReminders())['e1:d1'].status).toBe('failed');
  });

  it('prefers the earliest event and releases only event slots for waste', async () => {
    for (let index = 0; index < IOS_LOCAL_NOTIFICATION_BUDGET - 1; index++) {
      const identifier = `existing-${index}`;
      native.set(identifier, {
        identifier,
        content: { data: {} }
      } as Notifications.NotificationRequest);
    }

    expect(await saveEventReminder(venue, rule)).toBe('scheduled');
    const earlier = { ...venue, occurrenceId: 'earlier', date: '2026-11-19' };
    expect(await saveEventReminder(earlier, rule)).toBe('scheduled');
    expect((await readEventReminders())['e1:d1'].status).toBe('capacity');

    const restore = jest.fn();
    const unregister = registerEventReminderRestoration(restore);
    try {
      await runWasteNotificationUpdate(() => releaseEventSlotsForWaste(1));
      expect([...native.keys()]).toHaveLength(IOS_LOCAL_NOTIFICATION_BUDGET - 1);
      expect([...native.keys()].every((identifier) => identifier.startsWith('existing-'))).toBe(
        true
      );
      expect(restore).toHaveBeenCalledTimes(1);
    } finally {
      unregister();
    }
    await refreshEventReminders();
    expect(native.has('event-reminder:e1:earlier')).toBe(true);
  });

  it('keeps settings through permission loss and schedules again when permission returns', async () => {
    await saveEventReminder(venue, rule);
    (getLocalNotificationPermission as jest.Mock).mockResolvedValue(false);
    await refreshEventReminders();
    expect((await readEventReminders())['e1:d1'].status).toBe('permission');
    expect(native.size).toBe(0);
    (getLocalNotificationPermission as jest.Mock).mockResolvedValue(true);
    await refreshEventReminders();
    expect((await readEventReminders())['e1:d1'].status).toBe('scheduled');
  });

  it('updates a confirmed move by ID and preserves a reminder through a partial lookup', async () => {
    await saveEventReminder(venue, rule);
    const event = { id: 'e1', title: venue.title, visible: true };
    await applyEventReminderUpdates([{ ...event, dates: [] }]);
    expect(Notifications.cancelScheduledNotificationAsync).not.toHaveBeenCalled();
    await applyEventReminderUpdates([
      {
        ...event,
        dates: [{ id: 'd1', dateFrom: '2026-11-24', timeFrom: '19:00' }]
      }
    ]);
    expect(native.get('event-reminder:e1:d1')?.content.data.reminderAt).toBe(
      Date.parse('2026-11-21T18:00:00Z')
    );
    await applyEventReminderUpdates([{ ...event, visible: false }]);
    expect(native.size).toBe(0);
    expect(await readEventReminders()).toEqual({});
  });

  it('marks an invalid absolute reminder for review and ignores older source data', async () => {
    const rule = { kind: 'absolute', timestamp: Date.parse('2026-11-20T17:00:00Z') } as const;
    await saveEventReminder(venue, rule);
    const event = { id: 'e1', title: venue.title, visible: true };
    await applyEventReminderUpdates([
      {
        ...event,
        updatedAt: '2026-11-05T18:00:00Z',
        dates: [{ id: 'd1', dateFrom: '2026-11-19', timeFrom: '19:00' }]
      }
    ]);
    await applyEventReminderUpdates([
      {
        ...event,
        updatedAt: '2026-11-04T18:00:00Z',
        dates: [{ id: 'd1', dateFrom: venue.date, timeFrom: venue.time }]
      }
    ]);
    expect((await readEventReminders())['e1:d1']).toMatchObject({
      occurrence: { date: '2026-11-19' },
      rule,
      status: 'review'
    });
    expect(native.size).toBe(0);
  });
});
