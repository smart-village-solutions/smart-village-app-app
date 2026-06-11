import { removeHtml, trimNewLines } from '../htmlViewHelper';
import { momentFormat, momentFormatUtcToLocal } from '../momentHelper';

const DATE_TIME_PATTERN = /\b\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}\s*(?:Z|[+-]\d{2}:?\d{2})\b/g;
const DATE_PATTERN = /\b\d{4}-\d{2}-\d{2}\b/g;
const INVALID_DATE = 'Invalid date';

const formatDateTimeForSpeech = (value: string) => {
  const normalizedDateTime = value.replace('T', ' ');
  const formattedDateTime = momentFormatUtcToLocal(normalizedDateTime, 'DD.MM.YYYY HH:mm [Uhr]');

  return formattedDateTime === INVALID_DATE ? value : formattedDateTime;
};

const formatDateForSpeech = (value: string) => {
  const formattedDate = momentFormat(value, 'DD.MM.YYYY', 'YYYY-MM-DD');

  return formattedDate === INVALID_DATE ? value : formattedDate;
};

export const formatSpeechDates = (text: string) =>
  text
    .replace(DATE_TIME_PATTERN, formatDateTimeForSpeech)
    .replace(DATE_PATTERN, formatDateForSpeech);

export const normalizeSpeechText = (value?: string) => {
  if (!value) return '';

  return formatSpeechDates(trimNewLines(removeHtml(value))?.replace(/\s+/g, ' ').trim() || '');
};
