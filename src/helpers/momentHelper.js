import moment from 'moment';
import 'moment/locale/de';

/**
 * Format data strings of date and/or time with momentjs to a beautiful human readable string.
 *
 * @param {string | number} dateTime the required data string or timestamp to format
 * @param {string} returnFormat the optional data format of the resulting data string
 * @param {string} dateTimeFormat the optional data format of the passed data string
 *
 * @return {string} the formated date and/or time string
 */
export const momentFormat = (
  dateTime,
  returnFormat = 'DD.MM.YYYY',
  dateTimeFormat = 'YYYY-MM-DD HH:mm:ss Z'
) => moment(dateTime, dateTimeFormat).format(returnFormat);

/**
 * Check if a given date is today or in the future. We will check that with moment `isBefore`.
 *  https://momentjs.com/docs/#/query/is-before/
 *
 * If a date is not before today, it is upcoming.
 *
 * @param {string} date a date
 *
 * @return {bool} true if the date is today or in the future, false if in the past
 */
export const isUpcomingDate = (date) => {
  if (!date) return false;

  // "using day will check for year, month and day"
  return !moment(date).isBefore(moment(), 'day');
};

/**
 *
 * Check date/time periods for being active compared to now.
 *
 * @param {object} item an object with `dates`
 *
 * @return {bool} true if today and now is in the date and time range of the item and also
 * true if there are no `dates` information, because we want to show items without given
 * `dates` data
 */
export const isActive = (item) => {
  const { dates } = item;

  if (dates?.length) {
    const now = moment();

    return !!dates.find((date) => {
      const { dateStart, dateEnd, timeStart, timeEnd } = date;
      // initially false, because the `find` method returns the value of the first element in the
      // provided array that is true and if no none of our checks apply, active should be false
      let active = false;

      active = !dateStart || moment(dateStart).startOf('day').isBefore(now);
      active &&= !dateEnd || moment(dateEnd).endOf('day').isAfter(now);
      active &&= !timeStart || moment(timeStart, 'HH:mm').isBefore(now, 'HH:mm');
      active &&= !timeEnd || moment(timeEnd, 'HH:mm').isAfter(now, 'HH:mm');

      return active;
    });
  }

  return true;
};

const getReadableDay = (date) => {
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
 * @param {Date} date
 * @param {Date | undefined} start
 * @param {Date | undefined} end
 * @return {boolean}
 */
const dateIsWithinInterval = (date, start, end) => {
  // return false if the end is before the date
  if (end) {
    if (!moment(date).isBefore(end)) {
      return false;
    }
  }
  // return false if the start is after the date
  if (start) {
    if (!moment(date).isSameOrAfter(start)) {
      return false;
    }
  }

  return true;
};

/**
 * @param {{
 *  open: boolean | null;
 *  weekday: string;
 *  dateFrom: string;
 *  dateTo: string;
 *  timeFrom: string;
 *  timeTo: string
 * }} info
 * @param {Date} date
 * @returns {boolean}
 */
const isOpeningTimeForDate = (info, date) =>
  dateIsWithinInterval(
    date,
    info.dateFrom ? moment(new Date(info.dateFrom)).startOf('day').toDate() : undefined,
    info.dateTo ? moment(new Date(info.dateTo)).endOf('day').toDate() : undefined
  );

/**
 * @param {string} time of the from "hh:mm"
 * @return {Date}
 */
const getTodayWithTime = (time) => {
  return moment(time, 'HH:mm').toDate();
};

/**
 * Parses an opening time into a time interval
 * @param {{
 *  open: boolean | null;
 *  weekday: string;
 *  dateFrom: string;
 *  dateTo: string;
 *  timeFrom: string;
 *  timeTo: string
 * }} openingTime
 */
const getIntervalFromOpeningTime = (openingTime) => {
  return {
    timeFrom: openingTime.timeFrom?.length ? getTodayWithTime(openingTime.timeFrom) : undefined,
    timeTo: openingTime.timeTo?.length ? getTodayWithTime(openingTime.timeTo) : undefined
  };
};

/**
 * merges two time intervals, if they overlap
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }} timeA
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }} timeB
 * @returns {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * } | undefined} the merged interval, if they overlapped, or undefined otherwise
 */
// eslint-disable-next-line complexity
const mergeIntervals = (timeA, timeB) => {
  // check which one starts first
  let isAFirst = false;

  if (timeA.timeFrom && timeB.timeFrom) {
    isAFirst = timeA.timeFrom < timeB.timeFrom;
  } else if (!timeA.timeFrom) {
    isAFirst = true;
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
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }[]} intervals
 * @returns {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 *  }[]} Disjoint and sorted time intervals
 */
const mergeAndSortTimeIntervals = (intervals) => {
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

  // merge intervals starting from the one that starts first
  return sortedIntervals.reduce(
    (mergedIntervals, currentInterval) => {
      const latest = mergedIntervals.pop();
      const result = mergeIntervals(latest, currentInterval);

      // if they overlap, use the merged interval
      if (result) {
        mergedIntervals.push(result);
        return mergedIntervals;
      }

      // if they do not overlap, then the latest one will not overlap with any others, and is completely merged already.
      // in that case the current interval needs to be checked in the next step of reducing the array
      mergedIntervals.push(latest, currentInterval);

      return mergedIntervals;
    },
    [sortedIntervals[0]]
  );
};

/**
 * Finds the next interval after, or surrounding the time, that is open, but not closed.
 * It assumes that both the openIntervals and the closedIntervals are consisting of sorted and disjoint intervals.
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }[]} openIntervals
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }[]} closedIntervals
 * @param {Date} time
 * @returns {Date | undefined} nextOpenTime
 */
const findNextOpenTime = (openIntervals, closedIntervals, time) => {
  let opens = openIntervals.filter((interval) => !interval.timeTo || interval.timeTo > time);

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
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }[]} openIntervals
 * @param {{
 *  timeFrom?: Date;
 *  timeTo?: Date;
 * }[]} closedIntervals
 * @param {Date} time
 * @returns {Date | undefined} nextClosedTime
 */
const findNextClosedTime = (openIntervals, closedIntervals, time) => {
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
 * Checks for a given array of opening times, if it is currently open, and if it opens or closes soon.
 * The timeDiff contains the remaining minutes until it opens or closes,
 * timeDiff may be undefined, if there are opening times where either timeFrom or timeTo is missing.
 * @param {{
 *  open: boolean | null;
 *  weekday: string;
 *  dateFrom: string;
 *  dateTo: string;
 *  timeFrom: string;
 *  timeTo: string
 * }[]} openingHours
 * @returns {{ timeDiff?: number; open: boolean } | undefined}
 */
export const isOpen = (openingHours) => {
  // wrap everything into a try/catch in case of one of the strings used as dates do not have an acceptable format
  try {
    // get the current time up to minute precision to work with
    const now = new Date();

    now.setSeconds(0);
    now.setMilliseconds(0);

    // filter out all times that are
    //  - not corresponding to the correct weekday
    //  - that have a date range that is not currently valid
    const todaysTimes = openingHours
      .filter((info) => info.weekday === getReadableDay(now) || !info.weekday)
      .filter((info) => isOpeningTimeForDate(info, now));

    const todaysOpenTimes = todaysTimes.filter((info) => !!info.open);
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
