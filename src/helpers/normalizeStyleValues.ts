import { normalize } from '../config';

export const normalizeStyleValues = (styleObj: any) => {
  if (!Object.keys(styleObj).length) return styleObj;

  const normalizedStyle: { [key: string]: any } = {};

  for (const key in styleObj) {
    const value = styleObj[key];

    if (typeof value === 'number') {
      normalizedStyle[key] = normalize(value);
    } else if (typeof value === 'object' && value !== null) {
      normalizedStyle[key] = normalizeStyleValues(value);
    } else {
      normalizedStyle[key] = value;
    }
  }

  return normalizedStyle;
};
