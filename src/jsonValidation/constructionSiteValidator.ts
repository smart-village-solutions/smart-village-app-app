import _isArray from 'lodash/isArray';

import { ConstructionSite } from '../types';

import {
  isGeoLocationOrUndefined,
  isStringArrayOrUndefined,
  isStringOrUndefined
} from './basicTypeValidation';

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

export const filterForValidConstructionSites = (
  parsedGenericItems: unknown
): ConstructionSite[] => {
  if (!_isArray(parsedGenericItems)) return [];

  return parsedGenericItems.filter((item) => {
    if (!item) {
      return false;
    }

    return checkConstructionSiteTypes(item);
  });
};
