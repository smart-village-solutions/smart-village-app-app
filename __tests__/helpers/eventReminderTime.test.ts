import {
  eventLocalTimestamp,
  getEventOccurrences,
  getReminderTimestamp,
  isValidReminderTimestamp
} from '../../src/helpers/eventReminderTime';

const occurrence = {
  eventId: 'event',
  occurrenceId: 'date-1',
  title: 'Bürgerfest',
  date: '2026-11-20',
  time: '19:00'
};

describe('event reminder time', () => {
  it('subtracts calendar days and uses noon when the start time is missing', () => {
    const rule = { kind: 'relative', leadDays: 3 } as const;
    expect(getReminderTimestamp(occurrence, rule)).toBe(Date.parse('2026-11-17T18:00:00Z'));
    expect(getReminderTimestamp({ ...occurrence, time: undefined }, rule)).toBe(
      Date.parse('2026-11-17T11:00:00Z')
    );
  });

  it('uses the event time zone across the spring and autumn transitions', () => {
    expect(eventLocalTimestamp('2027-03-28', '02:30')).toBe(Date.parse('2027-03-28T01:30:00Z'));
    expect(eventLocalTimestamp('2027-10-31', '02:30')).toBe(Date.parse('2027-10-31T00:30:00Z'));
    expect(
      getReminderTimestamp({ ...occurrence, date: '2027-03-29' }, { kind: 'relative', leadDays: 3 })
    ).toBe(Date.parse('2027-03-26T18:00:00Z'));
  });

  it('rejects elapsed times and times at or after a known start', () => {
    const sameDay = eventLocalTimestamp('2026-11-20', '19:00');
    const now = eventLocalTimestamp('2026-11-19', '12:00');
    expect(isValidReminderTimestamp(occurrence, sameDay, now)).toBe(false);
    expect(isValidReminderTimestamp(occurrence, now, now)).toBe(false);
    expect(isValidReminderTimestamp(occurrence, sameDay - 60000, now)).toBe(true);
    expect(isValidReminderTimestamp({ ...occurrence, time: undefined }, sameDay, now)).toBe(true);
  });

  it('filters out recurrence spans and uses the original ID for a multi-day event', () => {
    const dates = [
      { id: 1, dateFrom: '2026-11-20', dateTo: '2026-11-30' },
      { id: 2, dateFrom: '2026-11-21', dateTo: '2026-11-21', timeFrom: '19:00' }
    ];
    const event = { id: 'event', title: 'Bürgerfest', dates };
    expect(getEventOccurrences({ ...event, recurring: true })).toEqual([
      { ...occurrence, occurrenceId: '2', date: '2026-11-21' }
    ]);
    expect(getEventOccurrences({ ...event, dates: [dates[0]] })).toEqual([
      { ...occurrence, occurrenceId: '1', time: undefined }
    ]);
    expect(
      getEventOccurrences({ ...event, dates: [{ ...dates[0], dateFrom: '2026-02-30' }] })
    ).toEqual([]);
  });
});
