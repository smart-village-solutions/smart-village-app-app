import { consts } from '../config';

const { UMLAUT_REGEX } = consts;

const UMLAUT_REPLACEMENTS: Record<string, string> = {
  ü: 'ue',
  ä: 'ae',
  ö: 'oe',
  Ü: 'UE',
  Ä: 'AE',
  Ö: 'OE',
  ß: 'ss'
};

export const umlautSwitcher = (text?: string | null): string => {
  if (!text) return '';

  return text
    .replace(UMLAUT_REGEX, (match: string) => UMLAUT_REPLACEMENTS[match] || match)
    .replace('​', '');
};
