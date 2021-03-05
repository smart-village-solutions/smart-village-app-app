import _isArray from 'lodash/isArray';
import _isObjectLike from 'lodash/isObjectLike';

export const isStringOrUndefined = (value: unknown): value is string | undefined => {
  return typeof value === 'string' || value === undefined;
};

export const isArrayOfType = <T>(
  data: unknown,
  checkItem: (item: unknown) => item is T
): data is T[] => {
  if (!data || !_isArray(data)) {
    return false;
  }

  return data.reduce((accumulated, current) => accumulated && checkItem(current), true);
};

export const isGeoLocationOrUndefined = (
  value: unknown
): value is { lat: number; lon: number } | undefined => {
  if (value === undefined) return true;

  return (
    _isObjectLike(value) &&
    typeof (value as { lat: unknown }).lat === 'number' &&
    typeof (value as { lon: unknown }).lon === 'number'
  );
};

export const isStringArrayOrUndefined = (value: unknown): value is string[] | undefined => {
  if (value === undefined) return true;

  return isArrayOfType(value, (item): item is string => typeof item === 'string');
};
