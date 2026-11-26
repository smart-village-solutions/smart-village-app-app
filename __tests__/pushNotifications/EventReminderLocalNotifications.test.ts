import * as Notifications from 'expo-notifications';

import { addToStore } from '../../src/helpers/storageHelper';
import {
  applyEventCategorySourceResults,
  applyEventReminderUpdates,
  getEventReminderModes,
  getEventRemindersEnabled,
  pauseEventCategorySubscription,
  pauseEventReminder,
  recordEventReminderDelivery,
  readEventReminders,
  readEventReminderSettings,
  refreshEventReminders,
  removeEventReminder,
  removeEventCategorySubscription,
  saveEventCategorySubscription,
  saveEventReminder,
  setEventCategoryExclusion
} from '../../src/pushNotifications/EventReminderLocalNotifications';
import {
  IOS_LOCAL_NOTIFICATION_BUDGET,
  registerEventReminderRestoration,
  releaseEventSlotsForWaste,
  runWasteNotificationUpdate
} from '../../src/pushNotifications/LocalNotificationCapacity';
import {
  getInAppPermission,
  getLocalNotificationPermission
} from '../../src/pushNotifications/PermissionHandling';

jest.mock('../../src/config', () => ({
  texts: {
    eventReminders: { title: 'Veranstaltungserinnerungen', notificationTitle: 'Erinnerung' }
  }
}));

jest.mock('../../src/helpers/storageHelper', () => {
  const stored = new Map<string, string>();
  return {
    addToStore: jest.fn(async (key, value) => {
      stored.set(key, JSON.stringify(value));
    }),
    readFromStore: jest.fn(async (key) => JSON.parse(stored.get(key) ?? 'null'))
  };
});

jest.mock('../../src/pushNotifications/PermissionHandling', () => ({
  getInAppPermission: jest.fn(),
  getLocalNotificationPermission: jest.fn()
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
    (getInAppPermission as jest.Mock).mockResolvedValue(true);
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
    await addToStore('@eventReminders:v1', null);
    await addToStore('@eventReminders:v2', null);
    jest.restoreAllMocks();
  });

  const singleOnly = { singleEnabled: true, categoryEnabled: false };
  const categoryOnly = { singleEnabled: false, categoryEnabled: true };
  const disabled = { singleEnabled: false, categoryEnabled: false };

  it('blocks new event reminders and cancels pending requests while in-app push is off', async () => {
    await expect(saveEventReminder(venue, rule)).resolves.toBe('scheduled');
    expect(native.size).toBe(1);
    jest.mocked(getInAppPermission).mockResolvedValue(false);
    await refreshEventReminders();
    expect(native.size).toBe(0);
    expect((await readEventReminders())['e1:d1']).toMatchObject({ rule, status: 'permission' });
    await expect(saveEventReminder(venue, rule)).resolves.toBe('permission');
    await expect(saveEventCategorySubscription({ id: 'a', name: 'Kultur' }, rule)).resolves.toBe(
      'permission'
    );
    expect((await readEventReminderSettings()).subscriptions).toEqual({});
    jest.mocked(getInAppPermission).mockResolvedValue(true);
    await refreshEventReminders();
    expect(native.size).toBe(1);
  });

  it('uses event_record for category reminders and singleEnabled for individual reminders', () => {
    const globalSettings = (tagList: string[], eventReminders = {}) => ({
      settings: {
        personalizedPush: { categories: { queryVariables: { tagList } }, eventReminders }
      }
    });
    expect(getEventReminderModes(globalSettings(['news_item']))).toEqual(disabled);
    expect(getEventRemindersEnabled(globalSettings(['news_item'], { categoryEnabled: true }))).toBe(
      false
    );
    expect(getEventReminderModes(globalSettings([], { singleEnabled: true }))).toEqual(singleOnly);
    expect(
      getEventReminderModes(globalSettings(['event_record'], { categoryEnabled: false }))
    ).toEqual(categoryOnly);
    expect(getEventRemindersEnabled(globalSettings(['event_record']))).toBe(true);
  });

  it('migrates single reminders into the combined store', async () => {
    await addToStore('@eventReminders:v1', {
      'e1:d1': { occurrence: venue, rule, status: 'scheduled' }
    });
    await refreshEventReminders();
    expect((await readEventReminderSettings()).singles['e1:d1'].status).toBe('scheduled');
    await removeEventReminder(venue);
    expect(await readEventReminders()).toEqual({});
  });

  const categories = [
    { id: 'a', name: 'Kultur' },
    { id: 'b', name: 'Familie' }
  ];
  const eventSnapshot = () => ({
    records: [
      {
        id: venue.eventId,
        title: venue.title,
        categories,
        visible: true,
        dates: [{ id: venue.occurrenceId, dateFrom: venue.date, timeFrom: venue.time }]
      }
    ],
    coverageThrough: '2027-01-30',
    syncedAt: Date.now()
  });

  it('keeps paused rules and subscriptions available for reactivation', async () => {
    const single = { ...venue, occurrenceId: 'single' };
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());
    await saveEventReminder(single, rule);

    await pauseEventReminder(single);
    await pauseEventCategorySubscription(categories[0].id);

    const paused = await readEventReminderSettings();
    expect(paused.singles['e1:single']).toMatchObject({ status: 'paused', rule });
    expect(paused.subscriptions.a).toMatchObject({ paused: true, rule });
    expect(native.size).toBe(0);

    await saveEventCategorySubscription(
      paused.subscriptions.a.category,
      paused.subscriptions.a.rule
    );
    await saveEventReminder(single, paused.singles['e1:single'].rule);
    expect(native.size).toBe(2);
  });

  it('keeps delayed requests pending and never reschedules a delivered single reminder on source refresh', async () => {
    await saveEventReminder(venue, rule);
    const id = 'event-reminder:e1:d1';
    const deliveredData = native.get(id)?.content.data;
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-18T10:00:00Z'));
    await refreshEventReminders();
    expect(native.has(id)).toBe(true);
    expect((await readEventReminderSettings()).singles['e1:d1'].status).toBe('scheduled');

    native.delete(id);
    await recordEventReminderDelivery(deliveredData);
    await applyEventReminderUpdates([
      {
        id: venue.eventId,
        title: venue.title,
        dates: [{ id: venue.occurrenceId, dateFrom: '2026-11-28', timeFrom: venue.time }]
      }
    ]);
    expect((await readEventReminderSettings()).singles['e1:d1']).toMatchObject({
      status: 'elapsed',
      completedAt: Date.now()
    });
    expect(native.size).toBe(0);
  });

  it('leaves native scheduling untouched without previously stored reminders', async () => {
    await refreshEventReminders(disabled);
    expect(Notifications.getAllScheduledNotificationsAsync).not.toHaveBeenCalled();
  });

  it('suspends only event requests and restores saved rules after opting in again', async () => {
    const waste: Notifications.NotificationRequest = {
      identifier: 'waste',
      content: {
        title: null,
        subtitle: null,
        body: null,
        categoryIdentifier: null,
        sound: null,
        data: { query_type: 'WasteAddresses' }
      },
      trigger: null
    };
    native.set(waste.identifier, waste);
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());
    await saveEventReminder({ ...venue, occurrenceId: 'single' }, rule);

    await refreshEventReminders(disabled);

    expect([...native.keys()]).toEqual([waste.identifier]);
    const settings = await readEventReminderSettings();
    expect(settings.categoryPlan).toEqual({});
    expect(settings.subscriptions.a.rule).toEqual(rule);
    expect(settings.singles['e1:single'].rule).toEqual(rule);

    await refreshEventReminders();

    expect([...native.keys()].sort()).toEqual([
      'event-reminder:e1:d1',
      'event-reminder:e1:single',
      waste.identifier
    ]);
  });

  it('replaces a disabled single rule with the active category and preserves both saved rules', async () => {
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());
    await saveEventReminder(venue, { ...rule, leadDays: 1 });

    await refreshEventReminders(categoryOnly);
    expect((await readEventReminderSettings()).categoryPlan['e1:d1'].categoryId).toBe('a');
    expect(native.get('event-reminder:e1:d1')?.content.data?.reminderAt).toBe(
      Date.parse('2026-11-17T18:00:00Z')
    );
    expect(await saveEventReminder(venue, rule, categoryOnly)).toBe('invalid');

    await refreshEventReminders(singleOnly);
    expect((await readEventReminderSettings()).categoryPlan).toEqual({});
    expect(native.get('event-reminder:e1:d1')?.content.data?.reminderAt).toBe(
      Date.parse('2026-11-19T18:00:00Z')
    );
    expect(await saveEventCategorySubscription(categories[0], rule, undefined, singleOnly)).toBe(
      'invalid'
    );
    expect((await readEventReminderSettings()).subscriptions.a.rule).toEqual(rule);
  });

  it('shares one native request across overlapping subscriptions and an explicit reminder', async () => {
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());
    await saveEventCategorySubscription(categories[1], { ...rule, leadDays: 1 }, eventSnapshot());
    expect((await readEventReminderSettings()).categoryPlan['e1:d1'].categoryId).toBe('a');
    expect(native.size).toBe(1);

    await saveEventReminder(venue, { ...rule, leadDays: 2 });
    expect((await readEventReminderSettings()).categoryPlan).toEqual({});
    expect(native.get('event-reminder:e1:d1')?.content.data.reminderAt).toBe(
      Date.parse('2026-11-18T18:00:00Z')
    );
    await removeEventCategorySubscription('a');
    expect(native.size).toBe(1);
    await removeEventReminder(venue);
    expect((await readEventReminderSettings()).categoryPlan['e1:d1'].categoryId).toBe('b');

    await setEventCategoryExclusion(venue, true);
    await refreshEventReminders();
    expect(native.size).toBe(0);
    await setEventCategoryExclusion(venue, false);
    expect(native.size).toBe(1);
  });

  it('preserves a plan after an incomplete or missing page and rejects a result from a deleted subscription', async () => {
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());
    const initial = (await readEventReminderSettings()).subscriptions.a;
    const request = { categoryId: 'a', revision: initial.revision };
    await applyEventCategorySourceResults([request]);
    const failed = (await readEventReminderSettings()).subscriptions.a;
    expect(failed).toMatchObject({ syncedAt: initial.syncedAt, syncStatus: 'failed' });
    expect(native.size).toBe(1);
    await applyEventCategorySourceResults([
      { ...request, snapshot: { ...eventSnapshot(), records: [] } }
    ]);
    expect(native.size).toBe(1);

    await removeEventCategorySubscription('a');
    await saveEventCategorySubscription(categories[0], rule);
    await applyEventCategorySourceResults([{ ...request, snapshot: eventSnapshot() }]);
    expect(native.size).toBe(0);
  });

  it('does not schedule a second category notification after the first is due', async () => {
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());
    await saveEventCategorySubscription(categories[1], { ...rule, leadDays: 1 }, eventSnapshot());
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-18T10:00:00Z'));
    await refreshEventReminders();
    expect(native.size).toBe(0);
  });

  it('ranks category and single events together after existing native requests consume capacity', async () => {
    for (let index = 0; index < IOS_LOCAL_NOTIFICATION_BUDGET - 1; index++) {
      const identifier = `waste-${index}`;
      native.set(identifier, {
        identifier,
        content: { data: { query_type: 'WasteAddresses' } }
      } as Notifications.NotificationRequest);
    }

    const later = { ...venue, eventId: 'e2', date: '2026-11-21' };
    await saveEventReminder(later, rule);
    await saveEventCategorySubscription(categories[0], rule, eventSnapshot());

    const settings = await readEventReminderSettings();
    expect(settings.categoryPlan['e1:d1'].status).toBe('scheduled');
    expect(settings.singles['e2:d1'].status).toBe('capacity');
    expect(native.size).toBe(IOS_LOCAL_NOTIFICATION_BUDGET);
  });

  it('removes a category request after the source confirms the membership changed', async () => {
    const snapshot = eventSnapshot();
    await saveEventCategorySubscription(categories[0], rule, snapshot);
    await applyEventReminderUpdates([{ ...snapshot.records[0], category: null, categories: [] }]);
    expect(native.size).toBe(0);
    expect((await readEventReminderSettings()).subscriptions.a.category).toEqual(categories[0]);
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
