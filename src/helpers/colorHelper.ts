/**
 * Normalizes various color representations to a 6-digit hex code.
 * @param color Color value in hex, short hex (e.g. #fff), or rgb format.
 * @returns A full hex string (#rrggbb) when the input is valid, otherwise `undefined`.
 */
export const parseColorToHex = (color: string) => {
  // check if it is already the correct format
  if (color.match(/^#[0-9a-fA-F]{6}$/)) {
    return color;
  }

  // check for format #fff
  const shortFormatMatches = /^#([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/.exec(color);
  if (shortFormatMatches) {
    shortFormatMatches.shift();
    shortFormatMatches.forEach((value, index) => (shortFormatMatches[index] = value + value));
    return `#${shortFormatMatches.join('')}`;
  }

  // check for format rgb(r,g,b) and group by each value
  const rgbFormatMatches = /^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/.exec(color);
  if (rgbFormatMatches) {
    rgbFormatMatches.shift();
    const hexValues = rgbFormatMatches.map((value) => {
      const hexValue = Number.parseInt(value);
      return hexValue < 16 ? `0${hexValue.toString(16)}` : hexValue.toString(16);
    });
    return `#${hexValues.join('')}`;
  }

  return undefined;
};
