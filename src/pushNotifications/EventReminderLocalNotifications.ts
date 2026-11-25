import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter, Platform } from 'react-native';

import { texts } from '../config';
import {
  EventOccurrence,
  EventReminderRule,
  eventOccurrenceKey,
  EventReminderRecord,
  getEventOccurrences,
  getReminderTimestamp,
  isValidReminderTimestamp,
  occurrenceEndForReminders,
  parseEventRecordUpdateTime
} from '../helpers/eventReminderTime';
import {
  EVENT_REMINDER_NOTIFICATION_KIND,
  isEventReminderNotification
} from '../helpers/notificationHelper';
import { addToStore, readFromStore } from '../helpers/storageHelper';

import {
  IOS_LOCAL_NOTIFICATION_BUDGET,
  runLocalNotificationUpdate
} from './LocalNotificationCapacity';
import {
  getLocalNotificationPermission,
  requestLocalNotificationPermission
} from './PermissionHandling';

const storeKey = '@eventReminders:v1';
export const EVENT_REMINDERS_CHANGED = 'event-reminders-changed';
const androidChannel = 'event-reminders';
const recentOccurrenceLookback = 7 * 24 * 60 * 60 * 1000;

type ReminderStatus = 'scheduled' | 'capacity' | 'permission' | 'failed' | 'review' | 'elapsed';

export type SingleEventReminder = {
  occurrence: EventOccurrence;
  rule: EventReminderRule;
  status: ReminderStatus;
  requiresReview?: boolean;
};

type ReminderState = Record<string, SingleEventReminder>;

export const getEventRemindersEnabled = (globalSettings: unknown): boolean =>
  (globalSettings as { settings?: { eventCalendar?: { reminders?: { enabled?: boolean } } } })
    ?.settings?.eventCalendar?.reminders?.enabled === true;

export const readEventReminders = async (): Promise<ReminderState> =>
  (await readFromStore(storeKey)) ?? {};

const writeEventReminders = async (state: ReminderState) => {
  await addToStore(storeKey, state);
  DeviceEventEmitter.emit(EVENT_REMINDERS_CHANGED);
};

const hasSchedulingPermission = async (request = false) => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return false;

  if (Platform.OS === 'android') {
    const channel = await Notifications.setNotificationChannelAsync(androidChannel, {
      name: texts.eventReminders.title,
      importance: Notifications.AndroidImportance.DEFAULT
    });
    if (!channel || channel.importance === Notifications.AndroidImportance.NONE) return false;
  }

  return request ? requestLocalNotificationPermission() : getLocalNotificationPermission();
};

const notificationId = (key: string) => `${EVENT_REMINDER_NOTIFICATION_KIND}:${key}`;

const scheduleEventReminder = async (key: string, reminder: SingleEventReminder, when: number) => {
  const { eventId, occurrenceId, title } = reminder.occurrence;
  await Notifications.scheduleNotificationAsync({
    identifier: notificationId(key),
    content: {
      title: texts.eventReminders.notificationTitle,
      body: title,
      data: {
        id: eventId,
        occurrenceId,
        query_type: 'EventRecord',
        notificationKind: EVENT_REMINDER_NOTIFICATION_KIND,
        reminderAt: when
      }
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: when,
      channelId: androidChannel
    }
  });
};

const toCandidates = (state: ReminderState, now: number) =>
  Object.entries(state)
    .map(([key, reminder]) => ({
      key,
      reminder,
      when: getReminderTimestamp(reminder.occurrence, reminder.rule)
    }))
    .filter(
      ({ reminder, when }) =>
        !reminder.requiresReview && isValidReminderTimestamp(reminder.occurrence, when, now)
    )
    .sort((left, right) => left.when - right.when || left.key.localeCompare(right.key));

type Candidate = ReturnType<typeof toCandidates>[number];

const commitNativePlan = async (
  eventInventory: Notifications.NotificationRequest[],
  desired: Map<string, Candidate>
) => {
  const current = new Set(eventInventory.map(({ identifier }) => identifier));
  for (const { identifier, content } of eventInventory) {
    const candidate = desired.get(identifier);
    if (
      candidate &&
      content.data?.reminderAt === candidate.when &&
      content.body === candidate.reminder.occurrence.title
    )
      continue;

    await Notifications.cancelScheduledNotificationAsync(identifier);
    current.delete(identifier);
  }

  for (const [identifier, { key, reminder, when }] of desired) {
    if (!current.has(identifier) && when > Date.now()) {
      await scheduleEventReminder(key, reminder, when).catch(() => undefined);
    }
  }

  return new Set(
    (desired.size ? await Notifications.getAllScheduledNotificationsAsync() : [])
      .filter(
        ({ identifier, content }) =>
          isEventReminderNotification(content.data) &&
          desired.get(identifier)?.when === content.data?.reminderAt
      )
      .map(({ identifier }) => identifier)
  );
};

const applyPlanStatus = (
  active: ReminderState,
  now: number,
  canSchedule: boolean,
  desired: Map<string, Candidate>,
  confirmed: Set<string>
) => {
  for (const [key, reminder] of Object.entries(active)) {
    const when = getReminderTimestamp(reminder.occurrence, reminder.rule);
    const id = notificationId(key);
    if (
      reminder.requiresReview ||
      !isValidReminderTimestamp(reminder.occurrence, when, -Infinity)
    ) {
      reminder.status = 'review';
    } else if (when <= now) reminder.status = 'elapsed';
    else if (!canSchedule) reminder.status = 'permission';
    else if (!desired.has(id)) reminder.status = 'capacity';
    else reminder.status = confirmed.has(id) ? 'scheduled' : 'failed';
  }
};

const reconcileEventReminders = async (state: ReminderState) => {
  const now = Date.now();
  const active = Object.fromEntries(
    Object.entries(state).filter(
      ([, { occurrence }]) => occurrenceEndForReminders(occurrence) > now - recentOccurrenceLookback
    )
  );
  const candidates = toCandidates(active, now);
  const canSchedule = candidates.length > 0 && (await hasSchedulingPermission());
  const inventory = await Notifications.getAllScheduledNotificationsAsync();
  const eventInventory = inventory.filter(({ content }) =>
    isEventReminderNotification(content.data)
  );
  const otherCount = inventory.length - eventInventory.length;
  const capacity =
    Platform.OS === 'ios'
      ? Math.max(0, IOS_LOCAL_NOTIFICATION_BUDGET - otherCount)
      : IOS_LOCAL_NOTIFICATION_BUDGET;
  const desired = new Map(
    (canSchedule ? candidates.slice(0, capacity) : []).map((candidate) => [
      notificationId(candidate.key),
      candidate
    ])
  );
  const confirmed = await commitNativePlan(eventInventory, desired);
  applyPlanStatus(active, now, canSchedule, desired, confirmed);
  return active;
};

const updateEventReminders = async (state: ReminderState) => {
  let next: ReminderState;
  try {
    next = await reconcileEventReminders(state);
  } catch {
    next = Object.fromEntries(
      Object.entries(state).map(([key, reminder]) => [key, { ...reminder, status: 'failed' }])
    );
    await writeEventReminders(next);
    throw new Error('Event reminder schedule could not be verified');
  }
  await writeEventReminders(next);
  return next;
};

export const refreshEventReminders = () =>
  runLocalNotificationUpdate(async () => {
    await updateEventReminders(await readEventReminders());
  });

const hasOlderSourceTimestamp = (record: EventReminderRecord, occurrence: EventOccurrence) => {
  const updatedAt = parseEventRecordUpdateTime(record.updatedAt);
  return updatedAt !== undefined && updatedAt < (occurrence.sourceUpdatedAt ?? -Infinity);
};

const updateReminderOccurrence = (reminder: SingleEventReminder, occurrence: EventOccurrence) => {
  const previous = reminder.occurrence;
  const moved = previous.date !== occurrence.date || previous.time !== occurrence.time;
  if (
    !moved &&
    previous.title === occurrence.title &&
    previous.sourceUpdatedAt === occurrence.sourceUpdatedAt
  ) {
    return false;
  }
  if (moved && reminder.rule.kind === 'absolute') {
    reminder.requiresReview = !isValidReminderTimestamp(occurrence, reminder.rule.timestamp);
  }
  reminder.occurrence = occurrence;
  return true;
};

export const applyEventReminderUpdates = (records: EventReminderRecord[]) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminders();
    const byEvent = new Map(records.map((record) => [String(record.id), record]));
    const occurrences = new Map(
      records
        .flatMap(getEventOccurrences)
        .map((occurrence) => [eventOccurrenceKey(occurrence), occurrence])
    );
    let changed = false;
    for (const [key, reminder] of Object.entries(state)) {
      const record = byEvent.get(reminder.occurrence.eventId);
      const occurrence = occurrences.get(key);
      if (!record || hasOlderSourceTimestamp(record, reminder.occurrence)) continue;

      // An absent or replaced ID is not an authoritative cancellation.
      if (record.visible === false) {
        delete state[key];
        changed = true;
      } else if (occurrence && updateReminderOccurrence(reminder, occurrence)) {
        changed = true;
      }
    }
    if (changed) {
      await writeEventReminders(state);
      await updateEventReminders(state);
    }
  });

export const saveEventReminder = (occurrence: EventOccurrence, rule: EventReminderRule) =>
  runLocalNotificationUpdate(async () => {
    const when = getReminderTimestamp(occurrence, rule);
    if (!isValidReminderTimestamp(occurrence, when)) return 'invalid';
    if (!(await hasSchedulingPermission(true))) return 'permission';

    const state = await readEventReminders();
    const key = eventOccurrenceKey(occurrence);
    state[key] = { occurrence, rule, status: 'failed' };
    await writeEventReminders(state);
    const updated = await updateEventReminders(state);
    return updated[key]?.status ?? 'elapsed';
  });

export const removeEventReminder = (occurrence: EventOccurrence) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminders();
    const key = eventOccurrenceKey(occurrence);
    // Persist the deletion first so a restart can retry cancellation without resurrecting the rule.
    delete state[key];
    await writeEventReminders(state);
    await updateEventReminders(state);
  });
