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
