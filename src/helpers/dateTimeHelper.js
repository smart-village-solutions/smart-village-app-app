import { momentFormat } from './momentHelper';

/**
 * Format event date strings with momentjs to a beautiful human readable string.
 *
 * @param {string} dateStart the start date of format 'YYYY-MM-DD'
 * @param {string} dateEnd the end date of format 'YYYY-MM-DD'
 *
 * @return {string} the formated event date string in format 'DD.MM.YYYY'
 */
export const eventDate = (dateStart, dateEnd) => {
  if (!dateStart && !dateEnd) return '';

  return momentFormat(dateStart || dateEnd);
};
