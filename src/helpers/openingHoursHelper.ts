import moment from 'moment';

import { OpeningHour } from '../types';

type OpeningInterval = {
  timeFrom?: Date;
  timeTo?: Date;
};

export const getReadableDay = (date: Date) => {
  switch (date.getDay()) {
    case 0:
      return 'Sonntag';
    case 1:
      return 'Montag';
    case 2:
      return 'Dienstag';
    case 3:
      return 'Mittwoch';
    case 4:
      return 'Donnerstag';
    case 5:
      return 'Freitag';
    case 6:
      return 'Samstag';
  }
};

/**
 * returns whether a date is after the end date or before the start date
 */
const dateIsWithinInterval = (date: Date, start?: Date, end?: Date) => {
  // return false if the end is before the date
  if (end) {
    if (!(date < end)) {
      return false;
    }
  }
  // return false if the start is after the date
  if (start) {
    if (!(date >= start)) {
      return false;
    }
  }

  return true;
};

const isOpeningTimeForDate = (info: OpeningHour, date: Date) =>
  dateIsWithinInterval(
    date,
    info.dateFrom ? moment(new Date(info.dateFrom)).startOf('day').toDate() : undefined,
    info.dateTo ? moment(new Date(info.dateTo)).endOf('day').toDate() : undefined
  );

const getTodayWithTime = (time: string) => {
  return moment(time, 'HH:mm').toDate();
};

const getIntervalFromOpeningTime = (openingHour: OpeningHour) => {
  return {
    timeFrom: openingHour.timeFrom?.length ? getTodayWithTime(openingHour.timeFrom) : undefined,
    timeTo: openingHour.timeTo?.length ? getTodayWithTime(openingHour.timeTo) : undefined
  };
};

/**
 * merges two time intervals, if they overlap
 * @returns the merged interval, if they overlapped, or undefined otherwise
 */
const mergeIntervals = (
  timeA: OpeningInterval,
  timeB: OpeningInterval
): OpeningInterval | undefined => {
  // check which one starts first
  let isAFirst = !timeA.timeFrom;

  if (timeA.timeFrom && timeB.timeFrom) {
    isAFirst = timeA.timeFrom < timeB.timeFrom;
  }

  const first = isAFirst ? timeA : timeB;
  const second = isAFirst ? timeB : timeA;

  // check if the one that starts first ends after the other one started, which means that they do not overlap
  if (first.timeTo && second.timeFrom && first.timeTo < second.timeFrom) {
    // if this is the case, they do not overlap
    return;
  }

  // find the later ending time and return with the start time of the first one
  // if one of them does not end, the merged one does not end
  if (!first.timeTo || !second.timeTo) {
    return { timeFrom: first.timeFrom };
  }

  return {
    timeFrom: first.timeFrom,
    timeTo: first.timeTo < second.timeTo ? second.timeTo : first.timeTo
  };
};

/**
 * Merges all overlapping intervals and sorts them.
 * @returns  Disjoint and sorted time intervals
 */
const mergeAndSortTimeIntervals = (intervals: OpeningInterval[]) => {
  if (!intervals.length) {
    return [];
  }
  // sort by starting times
  const sortedIntervals = [...intervals].sort((a, b) => {
    if (!a.timeFrom && !b.timeFrom) {
      return 0;
    }
    if (!a.timeFrom) {
      return -1;
    }
    if (!b.timeFrom) {
      return 1;
    }
    return a.timeFrom < b.timeFrom ? -1 : 1;
  });

  if (!sortedIntervals.length) {
    return [];
  }

  // merge intervals starting from the one that starts first
  return sortedIntervals.reduce(
    (mergedIntervals, currentInterval) => {
      // this will always be defined, because we start with a non empty array
      const previousInterval = mergedIntervals.pop() as OpeningInterval;
      const result = mergeIntervals(previousInterval, currentInterval);

      // if they overlap, use the merged interval
      if (result) {
        mergedIntervals.push(result);
        return mergedIntervals;
      }

      // if they do not overlap, then the previous interval will not overlap with any others, and is completely merged already.
      // in that case the current interval needs to be checked in the next step of reducing the array
      mergedIntervals.push(previousInterval, currentInterval);

      return mergedIntervals;
    },
    [sortedIntervals[0]]
  );
};

/**
 * Finds the next interval after, or surrounding the time, that is open, but not closed.
 * It assumes that both the openIntervals and the closedIntervals are consisting of sorted and disjoint intervals.
 */
const findNextOpenTime = (
  openIntervals: OpeningInterval[],
  closedIntervals: OpeningInterval[],
  time: Date
): Date | undefined => {
  const opens = openIntervals.filter((interval) => !interval.timeTo || interval.timeTo > time);

  if (!opens.length) {
    return;
  }

  const closed = closedIntervals.find((interval) =>
    dateIsWithinInterval(time, interval.timeFrom, interval.timeTo)
  );

  if (closed) {
    if (!closed.timeTo) {
      return;
    }

    return findNextOpenTime(opens, closedIntervals, closed.timeTo);
  }

  return opens[0].timeFrom && opens[0].timeFrom > time ? opens[0].timeFrom : time;
};

/**
 * Finds the next interval after, or surrounding the time, that is not open or closed.
 * It assumes that both the openIntervals and the closedIntervals are consisting of sorted and disjoint intervals.
 */
const findNextClosedTime = (
  openIntervals: OpeningInterval[],
  closedIntervals: OpeningInterval[],
  time: Date
) => {
  const openInterval = openIntervals.find((interval) =>
    dateIsWithinInterval(time, interval.timeFrom, interval.timeTo)
  );
  const closedInterval = closedIntervals.find((interval) =>
    dateIsWithinInterval(time, interval.timeFrom, interval.timeTo)
  );

  // if it is open and not closed, find the next closed time and compare if that is sooner than the open time expiring
  if (openInterval && !closedInterval) {
    const upcomingClosedTime = closedIntervals.find(
      (interval) => !!interval.timeFrom && interval.timeFrom > time
    )?.timeFrom;

    if (upcomingClosedTime && openInterval.timeTo) {
      return upcomingClosedTime < openInterval.timeTo ? upcomingClosedTime : openInterval.timeTo;
    }

    return openInterval.timeTo || upcomingClosedTime;
  }

  // if it is either closed or not open, the time given is already a closed time.
  return time;
};

/**
 * WARNING: adding a date as 'now' that is not today may yield unexpected results.
 *
 * Checks for a given array of opening times, if it is currently open, and if it opens or closes soon.
 * The timeDiff contains the remaining minutes until it opens or closes,
 * timeDiff may be undefined, if there are opening times where either timeFrom or timeTo is missing.
 */
// eslint-disable-next-line complexity
export const isOpen = (
  openingHours: OpeningHour[],
  now = new Date()
): { open: boolean; timeDiff?: number } | undefined => {
  // wrap everything into a try/catch in case of one of the strings used as dates do not have an acceptable format
  try {
    now.setSeconds(0);
    now.setMilliseconds(0);

    // filter out all times that are
    //  - not corresponding to the correct weekday
    //  - that have a date range that is not currently valid
    const todaysTimes = openingHours
      .filter((info) => info.weekday === getReadableDay(now) || !info.weekday)
      .filter((info) => isOpeningTimeForDate(info, now));

    const todaysOpenTimes = todaysTimes.filter((info) => !!info.open && !!info.weekday);
    const todaysClosedTimes = todaysTimes.filter((info) => !info.open);

    // if there are no possible open times left, then it is currently closed, and will not open today
    if (!todaysOpenTimes.length) {
      return { open: false };
    }

    // simplify open and closed times
    const sortedOpenIntervals = mergeAndSortTimeIntervals(
      todaysOpenTimes.map(getIntervalFromOpeningTime)
    );
    const sortedClosedIntervals = mergeAndSortTimeIntervals(
      todaysClosedTimes.map(getIntervalFromOpeningTime)
    );

    // check if there is a current interval of being explicitly closed or open
    const currentOpenInterval = sortedOpenIntervals.find((interval) => {
      return dateIsWithinInterval(now, interval.timeFrom, interval.timeTo);
    });
    const currentClosedInterval = sortedClosedIntervals.find((interval) => {
      return dateIsWithinInterval(now, interval.timeFrom, interval.timeTo);
    });

    // if it is explicitly closed for an open ended interval, return { open: false }
    if (currentClosedInterval && !currentClosedInterval.timeTo) {
      return { open: false };
    }

    // if it is either explicitly closed or not open, find the next open time
    if (currentClosedInterval || !currentOpenInterval) {
      const nextOpenTime = findNextOpenTime(
        sortedOpenIntervals,
        sortedClosedIntervals,
        currentClosedInterval?.timeTo ?? now
      );

      return {
        open: false,
        timeDiff: nextOpenTime ? moment(nextOpenTime).diff(now, 'minute') : undefined
      };
    }

    // since it is not explicitly closed, check if it is open
    // check for how long it is open and when the next corresponding closed time is
    if (currentOpenInterval) {
      const nextClosedTime = findNextClosedTime(sortedOpenIntervals, sortedClosedIntervals, now);
      return {
        open: true,
        timeDiff: nextClosedTime ? moment(nextClosedTime).diff(now, 'minute') : undefined
      };
    }

    return { open: false };
  } catch (e) {
    console.warn('Error while determining opening times', e);
  }
};
