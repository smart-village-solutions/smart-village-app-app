export const EVENT_REMINDER_TIME_ZONE = 'Europe/Berlin';

export type EventOccurrence = {
  eventId: string;
  occurrenceId: string;
  title: string;
  date: string;
  time?: string;
  sourceUpdatedAt?: number;
};

export type EventReminderRule =
  | { kind: 'relative'; leadDays: number; time?: string }
  | { kind: 'absolute'; timestamp: number };

type EventDate = {
  id?: string | number | null;
  dateFrom?: string | null;
  dateTo?: string | null;
  timeFrom?: string | null;
  useOnlyTimeDescription?: boolean | string | null;
};

export type EventReminderRecord = {
  id: string | number;
  title: string;
  dates?: EventDate[] | null;
  recurring?: boolean | null;
  visible?: boolean | null;
  updatedAt?: string | null;
};

const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;
const dayMs = 24 * 60 * 60 * 1000;
const utcDate = (date: string) => Date.parse(`${date}T00:00:00Z`);
const isCalendarDate = (date: string) => {
  const timestamp = utcDate(date);
  return (
    datePattern.test(date) &&
    Number.isFinite(timestamp) &&
    new Date(timestamp).toISOString().slice(0, 10) === date
  );
};

const localFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: EVENT_REMINDER_TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23'
});

export const getEventLocalDateTime = (timestamp: number) => {
  const parts = Object.fromEntries(
    localFormatter.formatToParts(timestamp).map(({ type, value }) => [type, value])
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    time: `${parts.hour}:${parts.minute}`
  };
};

export const eventLocalTimestamp = (date: string, time: string): number => {
  if (!isCalendarDate(date) || !timePattern.test(time)) return NaN;

  const wallTime = Date.parse(`${date}T${time}:00Z`);
  const offsets = [wallTime - dayMs, wallTime + dayMs].map((sample) => {
    const local = getEventLocalDateTime(sample);
    return Date.parse(`${local.date}T${local.time}:00Z`) - sample;
  });
  const candidates = offsets.map((offset) => wallTime - offset).sort((left, right) => left - right);

  // On an overlap choose the first occurrence. In a gap preserve minutes and move forward.
  return (
    candidates.find((candidate) => {
      const local = getEventLocalDateTime(candidate);
      return local.date === date && local.time === time;
    }) ?? candidates[1]
  );
};

const shiftCalendarDate = (date: string, days: number) =>
  new Date(utcDate(date) + days * dayMs).toISOString().slice(0, 10);

export const occurrenceEndForReminders = ({ date, time }: EventOccurrence) =>
  time ? eventLocalTimestamp(date, time) : eventLocalTimestamp(shiftCalendarDate(date, 1), '00:00');

export const getReminderTimestamp = (occurrence: EventOccurrence, rule: EventReminderRule) => {
  if (rule.kind === 'absolute') return rule.timestamp;

  return eventLocalTimestamp(
    shiftCalendarDate(occurrence.date, -rule.leadDays),
    rule.time ?? occurrence.time ?? '12:00'
  );
};

export const isValidReminderTimestamp = (
  occurrence: EventOccurrence,
  timestamp: number,
  now = Date.now()
) => timestamp > now && timestamp < occurrenceEndForReminders(occurrence);

export const getEventOccurrences = (event: EventReminderRecord): EventOccurrence[] => {
  if (event.visible === false) return [];

  // List rows alone can represent synthetic days of a multi-day event.
  const dates = event.dates ?? [];
  const knownOccurrences = dates.filter(
    ({ id, dateFrom, dateTo }) =>
      id != null &&
      !!dateFrom &&
      isCalendarDate(dateFrom) &&
      (!event.recurring || !dateTo || dateFrom === dateTo)
  );
  const updatedAt = parseEventRecordUpdateTime(event.updatedAt);

  const occurrences = knownOccurrences.map(({ id, dateFrom, timeFrom, useOnlyTimeDescription }) => {
    const time = timeFrom?.slice(0, 5);
    const hasFixedTime = useOnlyTimeDescription !== true && useOnlyTimeDescription !== 'true';

    return {
      eventId: String(event.id),
      occurrenceId: String(id),
      title: event.title,
      date: dateFrom as string,
      time: hasFixedTime && time && timePattern.test(time) ? time : undefined,
      ...(updatedAt === undefined ? {} : { sourceUpdatedAt: updatedAt })
    };
  });
  return occurrences.sort((left, right) => {
    const leftStart = `${left.date}T${left.time ?? '23:59'}`;
    const rightStart = `${right.date}T${right.time ?? '23:59'}`;
    return (
      leftStart.localeCompare(rightStart) || left.occurrenceId.localeCompare(right.occurrenceId)
    );
  });
};

export const parseEventRecordUpdateTime = (timestamp?: string | null) => {
  const parsed = Date.parse(timestamp ?? '');
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const eventOccurrenceKey = ({ eventId, occurrenceId }: EventOccurrence) =>
  `${eventId}:${occurrenceId}`;
