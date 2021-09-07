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
