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
