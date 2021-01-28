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
 * Check if a given event date is today or in the future. We will check that with moment `isBefore`.
 *  https://momentjs.com/docs/#/query/is-before/
 *
 * If a date is not before today, it is upcoming.
 *
 * @param {string} eventDate a date
 *
 * @return {bool} true if the eventDate is today or in the future, false if in the past
 */
export const isUpcomingEvent = (eventDate) => {
  if (!eventDate) return false;

  // "using day will check for year, month and day"
  return !moment(eventDate).isBefore(moment(), 'day');
};

const isDateActive = (now, dateStart, dateEnd) => {
  const dateStartBeforeToday = moment(dateStart).startOf('day').isBefore(now, 'day');
  const dateEndAfterToday = moment(dateEnd).endOf('day').isAfter(now, 'day');

  if (
    // active if only start date is present and smaller than current date
    (dateStartBeforeToday && !dateEnd) ||
    // active if only end date is present and bigger than current date
    (!dateStart && dateEndAfterToday) ||
    // active if current date is in between start date and end date
    (dateStartBeforeToday && dateEndAfterToday)
  ) {
    return true;
  }

  return false;
};

const isTimeActive = (now, timeStart, timeEnd) => {
  const timeStartBeforeNow = moment(timeStart, 'HH:mm').isBefore(now, 'HH:mm');
  const timeEndAfterNow = moment(timeEnd, 'HH:mm').isAfter(now, 'HH:mm');

  if (
    // active if start time is present and smaller than current time
    (timeStartBeforeNow && !timeEnd) ||
    // active if end time is present and bigger than current time
    (!timeStart && timeEndAfterNow) ||
    // active if current time is in between start time and end time
    (timeStartBeforeNow && timeEndAfterNow)
  ) {
    return true;
  }

  return false;
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
    let active = false;
    const now = moment();

    dates.forEach((date) => {
      const { dateStart, dateEnd, timeStart, timeEnd } = date;

      // examine the date period first, because it is more explicit than the time period
      active = isDateActive(now, dateStart, dateEnd);

      // th time period is checked, if there are no dates at all or if the date period is active
      // and only if one of start time or end time is present
      if (((!dateStart && !dateEnd) || active) && (timeStart || timeEnd)) {
        // determine the time situation last, because it can depend on the date
        active = isTimeActive(now, timeStart, timeEnd);
      }
    });

    return active;
  }

  return true;
};
