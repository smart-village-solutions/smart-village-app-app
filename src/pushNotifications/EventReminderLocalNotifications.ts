import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter, Platform } from 'react-native';

import { texts } from '../config';
import {
  CategoryPlanEntry,
  CategorySourceResult,
  CategorySourceSnapshot,
  CategorySubscription,
  EventReminderSettingsState,
  ReminderCandidate,
  ReminderStatus,
  SingleEventReminder,
  buildReminderCandidates,
  rememberElapsedCategoryPlans
} from '../helpers/eventReminderPlan';
import {
  EventOccurrence,
  EventReminderCategory,
  EventReminderRule,
  RelativeEventReminderRule,
  eventOccurrenceKey,
  EventReminderRecord,
  getEventOccurrences,
  getEventReminderCategories,
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

const legacyStoreKey = '@eventReminders:v1';
const storeKey = '@eventReminders:v2';
export const EVENT_REMINDERS_CHANGED = 'event-reminders-changed';
export const EVENT_REMINDER_SUBSCRIPTIONS_CHANGED = 'event-reminder-subscriptions-changed';
const androidChannel = 'event-reminders';
const recentOccurrenceLookback = 7 * 24 * 60 * 60 * 1000;

export type { SingleEventReminder } from '../helpers/eventReminderPlan';

export const getEventRemindersEnabled = (globalSettings: unknown): boolean =>
  (globalSettings as { settings?: { eventCalendar?: { reminders?: { enabled?: boolean } } } })
    ?.settings?.eventCalendar?.reminders?.enabled === true;

export const readEventReminderSettings = async (): Promise<EventReminderSettingsState> => {
  const saved = await readFromStore(storeKey);
  return (
    saved ?? {
      singles: (await readFromStore(legacyStoreKey)) ?? {},
      subscriptions: {},
      exclusions: {},
      categoryPlan: {},
      elapsedCategoryReminders: {},
      revision: 0
    }
  );
};

export const readEventReminders = async () => (await readEventReminderSettings()).singles;

const writeEventReminders = async (state: EventReminderSettingsState) => {
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

const scheduleEventReminder = async ({ key, occurrence, when }: ReminderCandidate) => {
  const { eventId, occurrenceId, title } = occurrence;
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

const commitNativePlan = async (
  eventInventory: Notifications.NotificationRequest[],
  desired: Map<string, ReminderCandidate>
) => {
  const current = new Set(eventInventory.map(({ identifier }) => identifier));
  const removedIds = new Set<string>();
  for (const { identifier, content } of eventInventory) {
    const candidate = desired.get(identifier);
    if (
      candidate &&
      content.data?.reminderAt === candidate.when &&
      content.body === candidate.occurrence.title
    )
      continue;

    await Notifications.cancelScheduledNotificationAsync(identifier);
    current.delete(identifier);
    if (!candidate) removedIds.add(identifier);
  }

  for (const [identifier, candidate] of desired) {
    if (!current.has(identifier) && candidate.when > Date.now()) {
      await scheduleEventReminder(candidate).catch(() => undefined);
    }
  }

  return verifyNativePlan(desired, removedIds);
};

const verifyNativePlan = async (
  desired: Map<string, ReminderCandidate>,
  removedIds: Set<string>
) => {
  if (!desired.size && !removedIds.size) return new Set<string>();
  const verified = await Notifications.getAllScheduledNotificationsAsync();
  if (verified.some(({ identifier }) => removedIds.has(identifier))) {
    throw new Error('Event reminder cancellation could not be verified');
  }
  return new Set(
    verified
      .filter(
        ({ identifier, content }) =>
          isEventReminderNotification(content.data) &&
          desired.get(identifier)?.when === content.data?.reminderAt
      )
      .map(({ identifier }) => identifier)
  );
};

const planningStatus = (
  key: string,
  canSchedule: boolean,
  desired: Map<string, ReminderCandidate>,
  confirmed: Set<string>
): ReminderStatus => {
  if (!canSchedule) return 'permission';
  const id = notificationId(key);
  if (!desired.has(id)) return 'capacity';
  return confirmed.has(id) ? 'scheduled' : 'failed';
};

const pruneReminderSettings = (state: EventReminderSettingsState, now: number) => {
  state.singles = Object.fromEntries(
    Object.entries(state.singles).filter(
      ([, { occurrence }]) => occurrenceEndForReminders(occurrence) > now - recentOccurrenceLookback
    )
  );
  state.elapsedCategoryReminders = rememberElapsedCategoryPlans(state, now);
  for (const subscription of Object.values(state.subscriptions)) {
    subscription.occurrences = Object.fromEntries(
      Object.entries(subscription.occurrences).filter(
        ([, occurrence]) => occurrenceEndForReminders(occurrence) > now - recentOccurrenceLookback
      )
    );
  }
};

const applyPlanStatus = (
  state: EventReminderSettingsState,
  now: number,
  candidates: ReminderCandidate[],
  statusFor: (key: string) => ReminderStatus
) => {
  for (const [key, reminder] of Object.entries(state.singles)) {
    const when = getReminderTimestamp(reminder.occurrence, reminder.rule);
    if (
      reminder.requiresReview ||
      !isValidReminderTimestamp(reminder.occurrence, when, -Infinity)
    ) {
      reminder.status = 'review';
    } else {
      reminder.status = when <= now ? 'elapsed' : statusFor(key);
    }
  }
  state.categoryPlan = Object.fromEntries(
    candidates.flatMap(({ key, categoryId, occurrence, when }) => {
      if (!categoryId) return [];
      const entry: CategoryPlanEntry = { categoryId, occurrence, when, status: statusFor(key) };
      return [[key, entry]];
    })
  );
};

const reconcileEventReminders = async (state: EventReminderSettingsState) => {
  const now = Date.now();
  pruneReminderSettings(state, now);
  const candidates = buildReminderCandidates(state, now);
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
  applyPlanStatus(state, now, candidates, (key) =>
    planningStatus(key, canSchedule, desired, confirmed)
  );
};

const updateEventReminders = async (state: EventReminderSettingsState) => {
  try {
    await reconcileEventReminders(state);
  } catch {
    const now = Date.now();
    applyPlanStatus(state, now, buildReminderCandidates(state, now), () => 'failed');
    await writeEventReminders(state);
    throw new Error('Event reminder schedule could not be verified');
  }
  await writeEventReminders(state);
};

export const refreshEventReminders = () =>
  runLocalNotificationUpdate(async () => {
    await updateEventReminders(await readEventReminderSettings());
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

const byOccurrenceKey = (records: EventReminderRecord[]) =>
  new Map(
    records
      .flatMap(getEventOccurrences)
      .map((occurrence) => [eventOccurrenceKey(occurrence), occurrence])
  );

const isRemovedFromCategory = (record: EventReminderRecord, categoryId: string) =>
  record.visible === false ||
  (Array.isArray(record.categories) &&
    !getEventReminderCategories(record).some(({ id }) => id === categoryId));

const updateKnownCategoryOccurrences = (
  state: EventReminderSettingsState,
  records: EventReminderRecord[]
) => {
  const byEvent = new Map(records.map((record) => [String(record.id), record]));
  const byKey = byOccurrenceKey(records);
  let changed = false;
  for (const subscription of Object.values(state.subscriptions)) {
    for (const [key, existing] of Object.entries(subscription.occurrences)) {
      const record = byEvent.get(existing.eventId);
      if (!record || hasOlderSourceTimestamp(record, existing)) continue;
      if (isRemovedFromCategory(record, subscription.category.id)) {
        delete subscription.occurrences[key];
        changed = true;
      } else {
        const latest = byKey.get(key);
        if (latest) {
          subscription.occurrences[key] = latest;
          changed = true;
        }
      }
    }
  }
  return changed;
};

export const applyEventReminderUpdates = (records: EventReminderRecord[]) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminderSettings();
    const byEvent = new Map(records.map((record) => [String(record.id), record]));
    const occurrences = byOccurrenceKey(records);
    let changed = false;
    for (const [key, reminder] of Object.entries(state.singles)) {
      const record = byEvent.get(reminder.occurrence.eventId);
      const occurrence = occurrences.get(key);
      if (!record || hasOlderSourceTimestamp(record, reminder.occurrence)) continue;

      // An absent or replaced ID is not an authoritative cancellation.
      if (record.visible === false) {
        delete state.singles[key];
        changed = true;
      } else if (occurrence && updateReminderOccurrence(reminder, occurrence)) {
        changed = true;
      }
    }
    const updatedCategories = updateKnownCategoryOccurrences(state, records);
    if (changed || updatedCategories) {
      await writeEventReminders(state);
      await updateEventReminders(state);
    }
  });

export const saveEventReminder = (occurrence: EventOccurrence, rule: EventReminderRule) =>
  runLocalNotificationUpdate(async () => {
    const when = getReminderTimestamp(occurrence, rule);
    if (!isValidReminderTimestamp(occurrence, when)) return 'invalid';
    if (!(await hasSchedulingPermission(true))) return 'permission';

    const state = await readEventReminderSettings();
    const key = eventOccurrenceKey(occurrence);
    state.singles[key] = { occurrence, rule, status: 'failed' };
    await writeEventReminders(state);
    await updateEventReminders(state);
    return state.singles[key]?.status ?? 'elapsed';
  });

export const removeEventReminder = (occurrence: EventOccurrence) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminderSettings();
    const key = eventOccurrenceKey(occurrence);
    // Persist the deletion first so a restart can retry cancellation without resurrecting the rule.
    delete state.singles[key];
    await writeEventReminders(state);
    await updateEventReminders(state);
  });

const mergeCategorySnapshot = (
  subscription: CategorySubscription,
  snapshot: CategorySourceSnapshot
) => {
  if ((subscription.syncedAt ?? 0) > snapshot.syncedAt) return;

  const matched = snapshot.records.filter((record) =>
    getEventReminderCategories(record).some(({ id }) => id === subscription.category.id)
  );
  for (const occurrence of matched.flatMap(getEventOccurrences)) {
    const key = eventOccurrenceKey(occurrence);
    const prior = subscription.occurrences[key];
    if (prior && (prior.sourceUpdatedAt ?? 0) > (occurrence.sourceUpdatedAt ?? 0)) continue;
    subscription.occurrences[key] = occurrence;
  }
  subscription.syncStatus = 'synced';
  subscription.syncedAt = snapshot.syncedAt;
  subscription.sourceCoverageThrough = snapshot.coverageThrough;
};

export const applyEventCategorySourceResults = (results: CategorySourceResult[]) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminderSettings();
    let changed = false;
    const records: EventReminderRecord[] = [];
    for (const { categoryId, revision, snapshot } of results) {
      const subscription = state.subscriptions[categoryId];
      if (subscription?.revision !== revision) continue;
      if (snapshot) {
        if ((subscription.syncedAt ?? 0) > snapshot.syncedAt) continue;
        mergeCategorySnapshot(subscription, snapshot);
        records.push(...snapshot.records);
      } else subscription.syncStatus = 'failed';
      changed = true;
    }
    if (changed) {
      updateKnownCategoryOccurrences(state, records);
      await writeEventReminders(state);
      await updateEventReminders(state);
    }
  });

export const saveEventCategorySubscription = (
  category: EventReminderCategory,
  rule: RelativeEventReminderRule,
  snapshot?: CategorySourceSnapshot
) =>
  runLocalNotificationUpdate(async () => {
    if (!(await hasSchedulingPermission(true))) return 'permission';
    const state = await readEventReminderSettings();
    const revision = ++state.revision;
    const existing = state.subscriptions[category.id];
    const subscription: CategorySubscription = {
      ...existing,
      category,
      rule,
      revision,
      occurrences: existing?.occurrences ?? {},
      syncStatus: 'pending'
    };
    if (snapshot) mergeCategorySnapshot(subscription, snapshot);
    state.subscriptions[category.id] = subscription;
    await writeEventReminders(state);
    try {
      await updateEventReminders(state);
    } finally {
      DeviceEventEmitter.emit(EVENT_REMINDER_SUBSCRIPTIONS_CHANGED);
    }
    return 'saved';
  });

export const removeEventCategorySubscription = (categoryId: string) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminderSettings();
    delete state.subscriptions[categoryId];
    await writeEventReminders(state);
    await updateEventReminders(state);
  });

export const setEventCategoryExclusion = (occurrence: EventOccurrence, excluded: boolean) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminderSettings();
    const key = eventOccurrenceKey(occurrence);
    if (excluded) state.exclusions[key] = true;
    else delete state.exclusions[key];
    await writeEventReminders(state);
    await updateEventReminders(state);
  });
