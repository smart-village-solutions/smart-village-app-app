/* eslint-disable complexity */
/**
 * Formatting a subtitle with a separating | if necessary
 *
 * @param {string | undefined} first text before the pipe
 * @param {string | undefined} time text before the pipe (Uhr)
 * @param {string | undefined} last text behind the pipe
 *
 * @return {string} a formatted string `first | last` or `time Uhr, last` or `time Uhr` or `first` or `last`
 */
export const subtitle = (first, last, time) => {
  if (!first && !time && !last) return '';

  if (first && time && last) return `${first}, ${time} Uhr | ${last}`;

  if (first && last) return `${first} | ${last}`;

  if (time && last) return `${time} Uhr | ${last}`;

  if (first) return first;

  if (time) return `${time} Uhr`;

  return last;
};
/* eslint-enable complexity */

/**
 * Truncate text to a certain length
 *
 * @param {string | undefined} text the text to truncate
 * @param {number | undefined} maxLength the maximum length of the text
 *
 * @return {string} the truncated text
 */
export const truncateText = (text, maxLength = 50) => {
  if (!text) return;

  if (text.length <= maxLength) return text;

  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');

  if (lastSpaceIndex > 0) {
    return truncated.substring(0, lastSpaceIndex) + '...';
  }

  return truncated + '...';
};
