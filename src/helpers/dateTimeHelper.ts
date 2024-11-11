import moment from 'moment';

import { texts } from '../config';

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

// if time is after 23:59:59, it means that the time is for the next day
// so we need to reduce the hours by 24 and make a new time format from it to return
// 00 for 24, 01 for 25, 02 for 26, etc.
export const normalizeTime = (time: string) => {
  let hour = Number(time.split(':')[0]);

  if (hour > 23) {
    hour -= 24;
    time = `${hour}:${time.split(':')[1]}`;
  }

  return time;
};

/**
 * Format availability date strings with momentjs to a beautiful human readable string.
 *
 * @param dateStart the start date of format 'YYYY-MM-DD'
 * @param dateEnd the end date of format 'YYYY-MM-DD'
 * @param returnFormat the format of the returned event data
 *
 * @return the formated `Verfügbar: ${dateStart}-${dateEnd}` or `Verfügbar ab: ${dateStart}` or `Verfügbar bis: ${dateEnd}`
 */
export const dateOfAvailabilityText = (
  dateStart?: string,
  dateEnd?: string,
  returnFormat?: string
) => {
  if (!dateStart && !dateEnd) {
    return;
  }

  if (dateStart && dateEnd) {
    const dates = momentFormat(dateStart, returnFormat) + '-' + momentFormat(dateEnd, returnFormat);

    return `${texts.voucher.detailScreen.available}: ${dates}`;
  } else if (dateStart) {
    return `${texts.voucher.detailScreen.availableFrom}: ${momentFormat(dateStart, returnFormat)}`;
  } else if (dateEnd) {
    return `${texts.voucher.detailScreen.availableTo}: ${momentFormat(dateEnd, returnFormat)}`;
  }
};
