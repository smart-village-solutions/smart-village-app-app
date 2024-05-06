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

  if (first && last) return `${first} | ${last}`;

  if (time && last) return `${time} Uhr, ${last}`;

  if (first) return first;

  if (time) return `${time} Uhr`;

  return last;
};
