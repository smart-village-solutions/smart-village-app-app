/**
 * Formatting a subtitle with a separating | if necessary
 *
 * @param {string | undefined} first text before the pipe
 * @param {string | undefined} last text behind the pipe
 *
 * @return {string} a formatted string `first | last` or `first` or `last`
 */
export const subtitle = (first, last) => {
  if (!first && !last) return '';

  if (first && last) return `${first} | ${last}`;

  if (first) return first;

  return last;
};

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
