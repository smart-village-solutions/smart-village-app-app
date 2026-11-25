import {
  EventOccurrence,
  EventReminderCategory,
  EventReminderListDetails,
  EventReminderRecord,
  EventReminderRule,
  RelativeEventReminderRule,
  eventLocalTimestamp,
  getReminderTimestamp,
  isValidReminderTimestamp,
  occurrenceEndForReminders,
  shiftEventCalendarDate
} from './eventReminderTime';

export type ReminderStatus =
  | 'scheduled'
  | 'capacity'
  | 'permission'
  | 'failed'
  | 'review'
  | 'paused'
  | 'elapsed';

export type SingleEventReminder = {
  occurrence: EventOccurrence;
  rule: EventReminderRule;
  status: ReminderStatus;
  requiresReview?: boolean;
  details?: EventReminderListDetails;
  completedAt?: number;
};

export type CategorySubscription = {
  category: EventReminderCategory;
  rule: RelativeEventReminderRule;
  revision: number;
  occurrences: Record<string, EventOccurrence>;
  paused?: boolean;
  syncStatus: 'pending' | 'synced' | 'failed';
  syncedAt?: number;
  sourceCoverageThrough?: string;
};

export type CategorySourceSnapshot = {
  records: EventReminderRecord[];
  coverageThrough: string;
  syncedAt: number;
};

export type CategorySourceResult = {
  categoryId: string;
  revision: number;
  snapshot?: CategorySourceSnapshot;
};

export type CategoryPlanEntry = {
  categoryId: string;
  occurrence: EventOccurrence;
  when: number;
  status: ReminderStatus;
};

export type EventReminderSettingsState = {
  singles: Record<string, SingleEventReminder>;
  subscriptions: Record<string, CategorySubscription>;
  exclusions: Record<string, true>;
  categoryPlan: Record<string, CategoryPlanEntry>;
  elapsedCategoryReminders: Record<string, number>;
  revision: number;
};

export type ReminderCandidate = {
  key: string;
  occurrence: EventOccurrence;
  when: number;
  categoryId?: string;
};

export type EventReminderModes = { singleEnabled: boolean; categoryEnabled: boolean };

export const EVENT_CATEGORY_TAG = 'event_record';
export const defaultEventReminderRule: RelativeEventReminderRule = {
  kind: 'relative',
  leadDays: 3
};
export const allEventReminderModes = { singleEnabled: true, categoryEnabled: true };

const compareCandidates = (left: ReminderCandidate, right: ReminderCandidate) =>
  left.when - right.when || left.key.localeCompare(right.key);

export const categoryReminderCoverageEnd = (through?: string) =>
  through ? eventLocalTimestamp(shiftEventCalendarDate(through, 1), '00:00') : Infinity;

export const previewCategoryReminders = (
  occurrences: EventOccurrence[],
  rule: RelativeEventReminderRule,
  now: number,
  through?: string
) => {
  const end = categoryReminderCoverageEnd(through);
  const due = occurrences
    .map((occurrence) => ({ occurrence, when: getReminderTimestamp(occurrence, rule) }))
    .filter(({ occurrence, when }) => when < end && isValidReminderTimestamp(occurrence, when, now))
    .sort((left, right) => left.when - right.when);
  return { count: due.length, next: due[0]?.when };
};

export const buildReminderCandidates = (
  state: EventReminderSettingsState,
  now: number,
  { singleEnabled, categoryEnabled }: EventReminderModes
) => {
  const singleRules = singleEnabled
    ? Object.fromEntries(
        Object.entries(state.singles).filter(([, reminder]) => reminder.status !== 'paused')
      )
    : {};
  const singles = Object.entries(singleRules).flatMap(([key, reminder]) => {
    const when = getReminderTimestamp(reminder.occurrence, reminder.rule);
    if (
      reminder.completedAt != null ||
      reminder.requiresReview ||
      !isValidReminderTimestamp(reminder.occurrence, when, now)
    )
      return [];
    return [{ key, occurrence: reminder.occurrence, when }];
  });
  const categories = categoryEnabled ? buildCategoryCandidates(state, singleRules, now) : [];
  return [...singles, ...categories].sort(compareCandidates);
};

const buildCategoryCandidates = (
  state: EventReminderSettingsState,
  singleRules: EventReminderSettingsState['singles'],
  now: number
) => {
  const categoryCandidates = new Map<string, ReminderCandidate>();
  for (const subscription of Object.values(state.subscriptions)) {
    if (subscription.paused) continue;
    const end = categoryReminderCoverageEnd(subscription.sourceCoverageThrough);
    for (const [key, occurrence] of Object.entries(subscription.occurrences)) {
      if (singleRules[key] || state.exclusions[key] || state.elapsedCategoryReminders[key])
        continue;
      const when = getReminderTimestamp(occurrence, subscription.rule);
      if (when >= end || !isValidReminderTimestamp(occurrence, when, now)) continue;
      const previous = categoryCandidates.get(key);
      const categoryId = subscription.category.id;
      if (previous && compareCategoryCandidates(previous, when, categoryId) <= 0) continue;
      categoryCandidates.set(key, { key, occurrence, when, categoryId });
    }
  }
  return categoryCandidates.values();
};

const compareCategoryCandidates = (previous: ReminderCandidate, when: number, categoryId: string) =>
  previous.when - when || String(previous.categoryId).localeCompare(categoryId);

export const summarizeCategoryPlan = (
  plan: Record<string, CategoryPlanEntry>,
  categoryId: string,
  now: number
) => {
  const remaining = Object.values(plan)
    .filter((entry) => entry.categoryId === categoryId && entry.when > now)
    .sort((left, right) => left.when - right.when);
  const confirmed = remaining.filter(({ status }) => status === 'scheduled');
  const firstGap = remaining.find(({ status }) => status !== 'scheduled');
  const coverage = confirmed.filter(({ when }) => !firstGap || when < firstGap.when).at(-1);
  return {
    scheduled: confirmed.length,
    pending: remaining.length - confirmed.length,
    next: confirmed[0]?.when,
    coverage: coverage?.when
  };
};

export const rememberElapsedCategoryPlans = (state: EventReminderSettingsState, now: number) => {
  const elapsed = Object.entries(state.elapsedCategoryReminders).filter(([, ends]) => ends > now);
  for (const [key, { occurrence, status, when }] of Object.entries(state.categoryPlan)) {
    if (status === 'scheduled' && when <= now && occurrenceEndForReminders(occurrence) > now) {
      elapsed.push([key, occurrenceEndForReminders(occurrence)]);
    }
  }
  return Object.fromEntries(elapsed);
};
