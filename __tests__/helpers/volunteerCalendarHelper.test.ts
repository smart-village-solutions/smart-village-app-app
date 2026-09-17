jest.mock('../../src/config', () => ({
  secrets: {
    'smart-village-app': {
      volunteer: { serverUrl: 'https://example.test/', v1: 'api/v1/', v2: 'api/v2/' }
    }
  }
}));

import {
  defaultVolunteerCalendarDateRange,
  volunteerCalendarDateRangeForVisibleRange,
  volunteerEventDates,
  volunteerEventIsUpcoming,
  volunteerEventOverlapsDate,
  volunteerListDate
} from '../../src/helpers/volunteerHelper';

describe('volunteer calendar date helpers', () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  it('reuses a range while the visible calendar is covered', () => {
    const currentRange: [string, string] = ['2026-06-01', '2027-06-01'];

    expect(
      volunteerCalendarDateRangeForVisibleRange(currentRange, ['2026-08-25', '2026-10-07'])
    ).toBe(currentRange);
  });

  it('starts a new bounded window when the visible calendar leaves the current range', () => {
    expect(
      volunteerCalendarDateRangeForVisibleRange(
        ['2026-06-01', '2027-06-01'],
        ['2027-06-25', '2027-08-07']
      )
    ).toEqual(['2027-06-25', '2028-06-24']);

    expect(
      volunteerCalendarDateRangeForVisibleRange(
        ['2030-06-25', '2031-06-25'],
        ['2026-06-01', '2026-07-07']
      )
    ).toEqual(['2026-06-01', '2027-06-01']);
  });

  it('creates a bounded one-year parent range', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-01T12:00:00.000Z'));

    expect(defaultVolunteerCalendarDateRange()).toEqual(['2026-06-01', '2027-06-01']);
  });

  it('keeps all-day end boundaries exclusive', () => {
    const event = {
      all_day: 1,
      start_datetime: '2026-06-01 00:00:00',
      end_datetime: '2026-06-04 00:00:00',
      time_zone: 'Europe/Berlin'
    };

    expect(volunteerEventDates(event)).toEqual(['2026-06-01', '2026-06-02', '2026-06-03']);
    expect(volunteerEventOverlapsDate(event, '2026-06-02')).toBe(true);
    expect(volunteerEventOverlapsDate(event, '2026-06-04')).toBe(false);
  });

  it('does not mark the next day when a timed event ends at midnight', () => {
    expect(
      volunteerEventDates({
        all_day: 0,
        start_datetime: '2026-06-01 22:00:00',
        end_datetime: '2026-06-02 00:00:00',
        time_zone: 'Europe/Berlin'
      })
    ).toEqual(['2026-06-01']);
  });

  it('marks every local date touched by a timed event', () => {
    expect(
      volunteerEventDates({
        all_day: 0,
        start_datetime: '2026-10-24 22:00:00',
        end_datetime: '2026-10-25 02:30:00',
        time_zone: 'Europe/Berlin'
      })
    ).toEqual(['2026-10-24', '2026-10-25']);
  });

  it('checks upcoming events against the current date in the event time zone', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-02T01:00:00.000Z'));

    expect(
      volunteerEventIsUpcoming({
        start_datetime: '2026-06-01 20:00:00',
        end_datetime: '2026-06-01 21:00:00',
        time_zone: 'America/Los_Angeles'
      })
    ).toBe(true);
    expect(
      volunteerEventIsUpcoming({
        start_datetime: '2026-06-01 20:00:00',
        end_datetime: '2026-06-01 21:00:00',
        time_zone: 'Europe/Berlin'
      })
    ).toBe(false);
  });

  it('uses the event time zone when assigning an ongoing timed event to today', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-02T01:00:00.000Z'));

    expect(
      volunteerListDate({
        start_datetime: '2026-05-31 20:00:00',
        end_datetime: '2026-06-02 20:00:00',
        time_zone: 'America/Los_Angeles'
      })
    ).toBe('2026-06-01');
  });

  it('keeps the current date for all-day events independent of their time zone', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-02T01:00:00.000Z'));

    expect(
      volunteerListDate({
        all_day: 1,
        start_datetime: '2026-05-31 00:00:00',
        end_datetime: '2026-06-03 00:00:00',
        time_zone: 'America/Los_Angeles'
      })
    ).toBe('2026-06-02');
  });

  it('checks all-day upcoming events against the local device date', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-06-02T01:00:00.000Z'));

    expect(
      volunteerEventIsUpcoming({
        all_day: 1,
        start_datetime: '2026-06-01 00:00:00',
        end_datetime: '2026-06-02 00:00:00',
        time_zone: 'America/Los_Angeles'
      })
    ).toBe(false);
  });
});
