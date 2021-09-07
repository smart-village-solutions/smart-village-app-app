import _isArray from 'lodash/isArray';

import { ConstructionSite } from '../types';

import {
  isGeoLocationOrUndefined,
  isStringArrayOrUndefined,
  isStringOrUndefined
} from './basicTypeValidation';

type ImageData = {
  captionText?: string;
  copyright?: string;
  url?: string;
};

const isImageData = (image: unknown): image is ImageData => {
  if (!image) {
    return true;
  }

  const { captionText, copyright, url } = image as ImageData;

  return (
    isStringOrUndefined(captionText) && isStringOrUndefined(copyright) && isStringOrUndefined(url)
  );
};

const checkConstructionSiteTypes = (item: unknown) => {
  const {
    category,
    cause,
    description,
    direction,
    endDate,
    image,
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
    isImageData(image) &&
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
