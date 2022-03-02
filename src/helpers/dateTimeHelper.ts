import moment from 'moment';

import { momentFormat } from './momentHelper';

/**
 * Format event date strings with momentjs to a beautiful human readable string.
 *
 * @param dateStart the start date of format 'YYYY-MM-DD'
 * @param dateEnd the end date of format 'YYYY-MM-DD'
 * @param returnFormat the format of the returned event data
 *
 * @return the formated event date string in format 'DD.MM.YYYY' or specified by `returnFormat`
 */
export const eventDate = (dateStart?: string, dateEnd?: string, returnFormat?: string) => {
  const dateToFormat = dateStart ?? dateEnd;

  if (!dateToFormat) {
    return '';
  } else {
    return momentFormat(dateToFormat, returnFormat);
  }
};

export const isBeforeEndOfToday = (date: string) => {
  return moment(date, 'YYYY-MM-DD').isBefore(moment().endOf('day'));
};

export const isTodayOrLater = (date: string) => {
  return moment().isBefore(moment(date, 'YYYY-MM-DD').endOf('day'));
};
