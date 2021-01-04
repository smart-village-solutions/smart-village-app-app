import _isArray from 'lodash/isArray';
import _isObjectLike from 'lodash/isObjectLike';
import { ConstructionSite } from '../types';

const isStringOrUndefined = (value: unknown): value is string | undefined => {
  return typeof value === 'string' || value === undefined;
};

const isGeoLocationOrUndefined = (
  value: unknown
): value is { lat: number; lon: number } | undefined => {
  if (value === undefined) return true;
  return (
    typeof _isObjectLike(value) &&
    typeof (value as { lat: unknown }).lat === 'number' &&
    typeof (value as { lon: unknown }).lon === 'number'
  );
};

const isStringArrayOrUndefined = (value: unknown): value is string[] | undefined => {
  if (value === undefined) return true;
  if (_isArray(value))
    return value.reduce((accumulated, current) => accumulated && typeof current === 'string', true);
  return false;
};

const checkConstructionSiteTypes = (item: unknown) => {
  const {
    category,
    cause,
    description,
    direction,
    endDate,
    imageUri,
    location,
    locationDescription,
    restrictions,
    startDate,
    title
  } = item as ConstructionSite;

  return (
    typeof title === 'string' &&
    typeof startDate === 'string' &&
    isStringOrUndefined(category) &&
    isStringOrUndefined(description) &&
    isStringOrUndefined(cause) &&
    isStringOrUndefined(direction) &&
    isStringOrUndefined(endDate) &&
    isStringOrUndefined(imageUri) &&
    isStringOrUndefined(locationDescription) &&
    isStringArrayOrUndefined(restrictions) &&
    isGeoLocationOrUndefined(location)
  );
};

export const filterForValidConstructionSites = (json: unknown): ConstructionSite[] => {
  if (!_isArray(json)) return [];
  return json.filter((item) => {
    if (!item) return false;
    return checkConstructionSiteTypes(item);
  });
};
