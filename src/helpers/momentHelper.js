import moment from 'moment';
import 'moment/locale/de';

/**
 * Format data strings of date and/or time with momentjs to a beautiful human readable string.
 *
 * @param {string} dateTime the required data string to format
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
