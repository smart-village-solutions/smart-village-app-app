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
  let formattedText = '';

  if (first && time && last) {
    formattedText = `${first}, ${time} Uhr | ${last}`;
  } else if (first && last) {
    formattedText = `${first} | ${last}`;
  } else if (time && last) {
    formattedText = `${time} Uhr | ${last}`;
  } else if (first) {
    formattedText = first;
  } else if (time) {
    formattedText = `${time} Uhr`;
  } else if (last) {
    formattedText = last;
  }

  return formattedText;
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
