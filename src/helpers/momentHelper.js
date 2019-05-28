import moment from 'moment';
import 'moment/locale/de';

/**
 * Format data strings of date and/or time with momentjs to a beautiful human readable string.
 *
 * @param {string} dateTime the required data string to format
 * @param {string} dateTimeFormat the optional data format of the passed data string
 * @param {string} returnFormat the optional data format of the resulting data string
 *
 * @return {string} the formated date and/or time string
 */
export const momentFormat = (
  dateTime,
  dateTimeFormat = 'YYYY-MM-DD HH:mm:ss Z',
  returnFormat = 'DD.MM.YYYY'
) => moment(dateTime, dateTimeFormat).format(returnFormat);
