import _isArray from 'lodash/isArray';
import _isObjectLike from 'lodash/isObjectLike';

export const isStringOrUndefined = (value: unknown): value is string | undefined => {
  return typeof value === 'string' || value === undefined;
};

export const isGeoLocationOrUndefined = (
  value: unknown
): value is { lat: number; lon: number } | undefined => {
  if (value === undefined) return true;

  return (
    typeof _isObjectLike(value) &&
    typeof (value as { lat: unknown }).lat === 'number' &&
    typeof (value as { lon: unknown }).lon === 'number'
  );
};

export const isStringArrayOrUndefined = (value: unknown): value is string[] | undefined => {
  if (value === undefined) return true;

  if (_isArray(value)) {
    return value.reduce((accumulated, current) => accumulated && typeof current === 'string', true);
  }
  return false;
};
