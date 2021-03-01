import moment from 'moment';
import { momentFormat } from './momentHelper';

/**
 * Format event date strings with momentjs to a beautiful human readable string.
 *
 * @param dateStart the start date of format 'YYYY-MM-DD'
 * @param dateEnd the end date of format 'YYYY-MM-DD'
 *
 * @return the formated event date string in format 'DD.MM.YYYY'
 */
export const eventDate = (dateStart?: string, dateEnd?: string) => {
  if (!dateStart && !dateEnd) {
    return '';
  } else {
    // by the previous check one of the two needs to be defined for moment format
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    return momentFormat((dateStart || dateEnd)!);
  }
};

export const isBeforeEndOfToday = (date: string) => {
  return moment(date, 'YYYY-MM-DD').isBefore(moment().endOf('day'));
};

export const isTodayOrLater = (date: string) => {
  return moment().isBefore(moment(date, 'YYYY-MM-DD').endOf('day'));
};
