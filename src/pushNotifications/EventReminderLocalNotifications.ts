import * as Notifications from 'expo-notifications';
import { DeviceEventEmitter, Platform } from 'react-native';

import { texts } from '../config';
import {
  CategoryPlanEntry,
  CategorySourceResult,
  CategorySourceSnapshot,
  CategorySubscription,
  EVENT_CATEGORY_TAG,
  EventReminderModes,
  EventReminderSettingsState,
  ReminderCandidate,
  ReminderStatus,
  SingleEventReminder,
  allEventReminderModes,
  buildReminderCandidates,
  categoryReminderCoverageEnd,
  rememberElapsedCategoryPlans
} from '../helpers/eventReminderPlan';
import {
  EventOccurrence,
  EventReminderCategory,
  EventReminderListDetails,
  EventReminderRule,
  RelativeEventReminderRule,
  eventOccurrenceKey,
  EventReminderRecord,
  getEventOccurrences,
  getEventReminderCategories,
  getEventReminderListDetails,
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
import { getInAppPermission, getLocalNotificationPermission } from './PermissionHandling';

const legacyStoreKey = '@eventReminders:v1';
const storeKey = '@eventReminders:v2';
export const EVENT_REMINDERS_CHANGED = 'event-reminders-changed';
export const EVENT_REMINDER_SUBSCRIPTIONS_CHANGED = 'event-reminder-subscriptions-changed';
const androidChannel = 'event-reminders';
const recentOccurrenceLookback = 7 * 24 * 60 * 60 * 1000;

export type { SingleEventReminder } from '../helpers/eventReminderPlan';

export const getEventReminderModes = (globalSettings: unknown): EventReminderModes => {
  const personalizedPush = (
    globalSettings as {
      settings?: {
        personalizedPush?: {
          categories?: { queryVariables?: { tagList?: unknown } };
          eventReminders?: { singleEnabled?: boolean };
        };
      };
    }
  )?.settings?.personalizedPush;
  const tags = personalizedPush?.categories?.queryVariables?.tagList;
  return {
    singleEnabled: personalizedPush?.eventReminders?.singleEnabled === true,
    categoryEnabled: Array.isArray(tags) && tags.includes(EVENT_CATEGORY_TAG)
  };
};

export const getEventRemindersEnabled = (globalSettings: unknown): boolean => {
  const { singleEnabled, categoryEnabled } = getEventReminderModes(globalSettings);
  return singleEnabled || categoryEnabled;
};

const emptyEventReminderSettings = (
  singles: EventReminderSettingsState['singles'] = {}
): EventReminderSettingsState => ({
  singles,
  subscriptions: {},
  exclusions: {},
  categoryPlan: {},
  elapsedCategoryReminders: {},
  revision: 0
});

const readStoredEventReminderSettings = async (): Promise<EventReminderSettingsState | null> => {
  const saved = await readFromStore(storeKey);
  if (saved) return saved;
  const singles = await readFromStore(legacyStoreKey);
  return singles ? emptyEventReminderSettings(singles) : null;
};

export const readEventReminderSettings = async (): Promise<EventReminderSettingsState> =>
  (await readStoredEventReminderSettings()) ?? emptyEventReminderSettings();

export const readEventReminders = async () => (await readEventReminderSettings()).singles;

const writeEventReminders = async (state: EventReminderSettingsState) => {
  await addToStore(storeKey, state);
  DeviceEventEmitter.emit(EVENT_REMINDERS_CHANGED);
};

export const getEventReminderPermission = async (): Promise<'system' | 'app' | 'allowed'> => {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') return 'system';
  if (!(await getLocalNotificationPermission())) return 'system';
  if (!(await getInAppPermission())) return 'app';

  if (Platform.OS === 'android') {
    const channel = await Notifications.setNotificationChannelAsync(androidChannel, {
      name: texts.eventReminders.title,
      importance: Notifications.AndroidImportance.DEFAULT
    });
    if (!channel || channel.importance === Notifications.AndroidImportance.NONE) return 'system';
  }

  return 'allowed';
};

const notificationId = (key: string) => `${EVENT_REMINDER_NOTIFICATION_KIND}:${key}`;

const scheduleEventReminder = async ({ key, occurrence, when, categoryId }: ReminderCandidate) => {
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
        reminderScope: categoryId ? 'category' : 'single',
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

const matchesNativeReminder = (
  data: Notifications.NotificationContent['data'],
  candidate: ReminderCandidate
) =>
  data?.reminderAt === candidate.when &&
  (data.reminderScope == null ||
    data.reminderScope === (candidate.categoryId ? 'category' : 'single'));

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
      matchesNativeReminder(content.data, candidate) &&
      (candidate.when <= Date.now() || content.body === candidate.occurrence.title)
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
      .filter(({ identifier, content }) => {
        const candidate = desired.get(identifier);
        return (
          candidate &&
          isEventReminderNotification(content.data) &&
          matchesNativeReminder(content.data, candidate)
        );
      })
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

const pruneReminderSettings = (
  state: EventReminderSettingsState,
  now: number,
  nativePendingCategoryKeys: ReadonlySet<string>
) => {
  state.singles = Object.fromEntries(
    Object.entries(state.singles).filter(
      ([, { occurrence }]) => occurrenceEndForReminders(occurrence) > now - recentOccurrenceLookback
    )
  );
  state.elapsedCategoryReminders = rememberElapsedCategoryPlans(
    state,
    now,
    nativePendingCategoryKeys
  );
  for (const subscription of Object.values(state.subscriptions)) {
    subscription.occurrences = Object.fromEntries(
      Object.entries(subscription.occurrences).filter(
        ([, occurrence]) => occurrenceEndForReminders(occurrence) > now - recentOccurrenceLookback
      )
    );
  }
};

const applySinglePlanStatus = (
  reminder: SingleEventReminder,
  now: number,
  getStatus: () => ReminderStatus
) => {
  if (reminder.status === 'paused' || reminder.completedAt != null) return;
  const when = getReminderTimestamp(reminder.occurrence, reminder.rule);
  if (reminder.requiresReview || !isValidReminderTimestamp(reminder.occurrence, when, -Infinity)) {
    reminder.status = 'review';
    return;
  }
  const status = getStatus();
  const elapsed = when <= now && status !== 'scheduled';
  if (elapsed && reminder.status === 'scheduled') reminder.completedAt = now;
  reminder.status = elapsed ? 'elapsed' : status;
};

const applyPlanStatus = (
  state: EventReminderSettingsState,
  now: number,
  candidates: ReminderCandidate[],
  { singleEnabled }: EventReminderModes,
  statusFor: (key: string) => ReminderStatus
) => {
  for (const [key, reminder] of Object.entries(singleEnabled ? state.singles : {})) {
    applySinglePlanStatus(reminder, now, () => statusFor(key));
  }
  state.categoryPlan = Object.fromEntries(
    candidates.flatMap(({ key, categoryId, occurrence, when }) => {
      if (!categoryId) return [];
      const entry: CategoryPlanEntry = { categoryId, occurrence, when, status: statusFor(key) };
      return [[key, entry]];
    })
  );
};

const waitingSingleCandidates = (
  state: EventReminderSettingsState,
  requests: ReadonlyMap<string, Notifications.NotificationContent['data']>,
  now: number
) => {
  return Object.entries(state.singles).flatMap(([key, reminder]) => {
    const { occurrence, rule, status } = reminder;
    if (status !== 'scheduled' || occurrenceEndForReminders(occurrence) <= now) return [];
    const when = getReminderTimestamp(occurrence, rule);
    const candidate = { key, occurrence, when };
    return when <= now && matchesNativeReminder(requests.get(notificationId(key)), candidate)
      ? [candidate]
      : [];
  });
};

const pendingCategoryPlans = (
  state: EventReminderSettingsState,
  requests: ReadonlyMap<string, Notifications.NotificationContent['data']>,
  now: number
) =>
  Object.entries(state.categoryPlan).filter(([key, entry]) => {
    const { status, when, occurrence } = entry;
    return (
      status === 'scheduled' &&
      when <= now &&
      occurrenceEndForReminders(occurrence) > now &&
      matchesNativeReminder(requests.get(notificationId(key)), { ...entry, key })
    );
  });

const waitingCategoryCandidates = (
  state: EventReminderSettingsState,
  pending: ReturnType<typeof pendingCategoryPlans>,
  { singleEnabled, categoryEnabled }: EventReminderModes,
  now: number
): ReminderCandidate[] => {
  if (!categoryEnabled) return [];
  return pending.flatMap(([key, { categoryId, when }]) => {
    const subscription = state.subscriptions[categoryId];
    if (!subscription || subscription.paused || state.exclusions[key]) return [];
    const single = singleEnabled ? state.singles[key] : undefined;
    if (single && single.status !== 'paused') return [];
    const occurrence = subscription.occurrences[key];
    if (
      !occurrence ||
      occurrenceEndForReminders(occurrence) <= now ||
      when >= categoryReminderCoverageEnd(subscription.sourceCoverageThrough) ||
      getReminderTimestamp(occurrence, subscription.rule) !== when
    ) {
      return [];
    }
    return [{ key, categoryId, occurrence, when }];
  });
};

const reconcileEventReminders = async (
  state: EventReminderSettingsState,
  modes: EventReminderModes
) => {
  const now = Date.now();
  const inventory = await Notifications.getAllScheduledNotificationsAsync();
  const eventInventory = inventory.filter(({ content }) =>
    isEventReminderNotification(content.data)
  );
  const requests = new Map(
    eventInventory.map(({ identifier, content }) => [identifier, content.data])
  );
  const pendingCategories = pendingCategoryPlans(state, requests, now);
  pruneReminderSettings(state, now, new Set(pendingCategories.map(([key]) => key)));
  const waiting = [
    ...(modes.singleEnabled ? waitingSingleCandidates(state, requests, now) : []),
    ...waitingCategoryCandidates(state, pendingCategories, modes, now)
  ].sort((left, right) => left.when - right.when || left.key.localeCompare(right.key));
  const waitingKeys = new Set(waiting.map(({ key }) => key));
  const candidates = [
    ...waiting,
    ...buildReminderCandidates(state, now, modes).filter(({ key }) => !waitingKeys.has(key))
  ];
  const canSchedule = candidates.length > 0 && (await getEventReminderPermission()) === 'allowed';
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
  if (!modes.singleEnabled) {
    for (const reminder of Object.values(state.singles)) {
      if (
        reminder.status === 'scheduled' &&
        getReminderTimestamp(reminder.occurrence, reminder.rule) > now
      ) {
        reminder.status = 'failed';
      }
    }
  }
  applyPlanStatus(state, now, candidates, modes, (key) =>
    planningStatus(key, canSchedule, desired, confirmed)
  );
};

const updateEventReminders = async (
  state: EventReminderSettingsState,
  modes: EventReminderModes
) => {
  try {
    await reconcileEventReminders(state, modes);
  } catch {
    const now = Date.now();
    // An unreadable native inventory cannot confirm delivery of scheduled category reminders.
    const unverified = Object.fromEntries(
      Object.entries(state.categoryPlan).filter(
        ([, entry]) => entry.status === 'scheduled' && entry.when <= now
      )
    );
    applyPlanStatus(state, now, buildReminderCandidates(state, now, modes), modes, (key) => {
      const reminder = state.singles[key];
      return reminder?.status === 'scheduled' &&
        getReminderTimestamp(reminder.occurrence, reminder.rule) <= now
        ? 'scheduled'
        : 'failed';
    });
    state.categoryPlan = { ...state.categoryPlan, ...unverified };
    await writeEventReminders(state);
    throw new Error('Event reminder schedule could not be verified');
  }
  await writeEventReminders(state);
};

export const refreshEventReminders = (modes = allEventReminderModes) =>
  runLocalNotificationUpdate(async () => {
    const state =
      modes.singleEnabled || modes.categoryEnabled
        ? await readEventReminderSettings()
        : await readStoredEventReminderSettings();
    if (state) await updateEventReminders(state, modes);
  });

export const recordEventReminderDelivery = (data: Notifications.NotificationContent['data']) =>
  runLocalNotificationUpdate(async () => {
    if (!isEventReminderNotification(data) || data?.reminderScope === 'category') return;
    const state = await readStoredEventReminderSettings();
    if (!state) return;
    const reminder = state.singles[`${data?.id}:${data?.occurrenceId}`];
    if (!reminder || reminder.completedAt != null) return;
    if (getReminderTimestamp(reminder.occurrence, reminder.rule) !== data?.reminderAt) return;
    reminder.status = 'elapsed';
    reminder.completedAt = Date.now();
    await writeEventReminders(state);
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

const updateKnownSingleOccurrences = (
  state: EventReminderSettingsState,
  records: EventReminderRecord[]
) => {
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
    } else if (occurrence && reminder.completedAt == null) {
      changed = updateReminderOccurrence(reminder, occurrence) || changed;
      const details = getEventReminderListDetails(record);
      if (JSON.stringify(details) !== JSON.stringify(reminder.details ?? {})) {
        reminder.details = details;
        changed = true;
      }
    }
  }
  return changed;
};

export const applyEventReminderUpdates = (
  records: EventReminderRecord[],
  modes = allEventReminderModes
) =>
  runLocalNotificationUpdate(async () => {
    const state = await readEventReminderSettings();
    const changed = modes.singleEnabled && updateKnownSingleOccurrences(state, records);
    const updatedCategories =
      modes.categoryEnabled && updateKnownCategoryOccurrences(state, records);
    if (changed || updatedCategories) {
      await writeEventReminders(state);
      await updateEventReminders(state, modes);
    }
  });

export const saveEventReminder = (
  occurrence: EventOccurrence,
  rule: EventReminderRule,
  modes = allEventReminderModes,
  details?: EventReminderListDetails
) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.singleEnabled) return 'invalid';
    const when = getReminderTimestamp(occurrence, rule);
    if (!isValidReminderTimestamp(occurrence, when)) return 'invalid';
    if ((await getEventReminderPermission()) !== 'allowed') return 'permission';

    const state = await readEventReminderSettings();
    const key = eventOccurrenceKey(occurrence);
    state.singles[key] = {
      occurrence,
      rule,
      status: 'failed',
      details: details ?? state.singles[key]?.details
    };
    await writeEventReminders(state);
    await updateEventReminders(state, modes);
    return state.singles[key]?.status ?? 'elapsed';
  });

export const removeEventReminder = (occurrence: EventOccurrence, modes = allEventReminderModes) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.singleEnabled) return;
    const state = await readEventReminderSettings();
    const key = eventOccurrenceKey(occurrence);
    // Persist the deletion first so a restart can retry cancellation without resurrecting the rule.
    delete state.singles[key];
    await writeEventReminders(state);
    await updateEventReminders(state, modes);
  });

export const pauseEventReminder = (occurrence: EventOccurrence, modes = allEventReminderModes) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.singleEnabled) return;
    const state = await readEventReminderSettings();
    const reminder = state.singles[eventOccurrenceKey(occurrence)];
    if (!reminder || reminder.completedAt != null || reminder.status === 'paused') return;
    reminder.status = 'paused';
    await writeEventReminders(state);
    await updateEventReminders(state, modes);
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

export const applyEventCategorySourceResults = (
  results: CategorySourceResult[],
  modes = allEventReminderModes
) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.categoryEnabled) return;
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
      await updateEventReminders(state, modes);
    }
  });

export const saveEventCategorySubscription = (
  category: EventReminderCategory,
  rule: RelativeEventReminderRule,
  snapshot?: CategorySourceSnapshot,
  modes = allEventReminderModes
) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.categoryEnabled) return 'invalid';
    if ((await getEventReminderPermission()) !== 'allowed') return 'permission';
    const state = await readEventReminderSettings();
    const revision = ++state.revision;
    const existing = state.subscriptions[category.id];
    const subscription: CategorySubscription = {
      ...existing,
      category,
      rule,
      revision,
      paused: false,
      occurrences: existing?.occurrences ?? {},
      syncStatus: 'pending'
    };
    if (snapshot) mergeCategorySnapshot(subscription, snapshot);
    state.subscriptions[category.id] = subscription;
    await writeEventReminders(state);
    try {
      await updateEventReminders(state, modes);
    } finally {
      DeviceEventEmitter.emit(EVENT_REMINDER_SUBSCRIPTIONS_CHANGED);
    }
    return 'saved';
  });

export const removeEventCategorySubscription = (
  categoryId: string,
  modes = allEventReminderModes
) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.categoryEnabled) return;
    const state = await readEventReminderSettings();
    delete state.subscriptions[categoryId];
    await writeEventReminders(state);
    await updateEventReminders(state, modes);
  });

export const pauseEventCategorySubscription = (categoryId: string, modes = allEventReminderModes) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.categoryEnabled) return;
    const state = await readEventReminderSettings();
    const subscription = state.subscriptions[categoryId];
    if (!subscription || subscription.paused) return;
    subscription.paused = true;
    subscription.revision = ++state.revision;
    await writeEventReminders(state);
    await updateEventReminders(state, modes);
  });

export const setEventCategoryExclusion = (
  occurrence: EventOccurrence,
  excluded: boolean,
  modes = allEventReminderModes
) =>
  runLocalNotificationUpdate(async () => {
    if (!modes.categoryEnabled) return;
    const state = await readEventReminderSettings();
    const key = eventOccurrenceKey(occurrence);
    if (excluded) state.exclusions[key] = true;
    else delete state.exclusions[key];
    await writeEventReminders(state);
    await updateEventReminders(state, modes);
  });
