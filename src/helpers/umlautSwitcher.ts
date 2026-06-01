import { consts } from '../config';

const { UMLAUT_REGEX } = consts;

export const umlautSwitcher = (text: string) => {
  if (!text) return;

  const umlautReplacements = {
    ü: 'ue',
    ä: 'ae',
    ö: 'oe',
    Ü: 'UE',
    Ä: 'AE',
    Ö: 'OE',
    ß: 'ss'
  };

  return text.replace(UMLAUT_REGEX, (match: string) => umlautReplacements[match])?.replace('​', '');
};
