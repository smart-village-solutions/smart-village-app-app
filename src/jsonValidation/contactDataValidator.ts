import _isObjectLike from 'lodash/isObjectLike';
import { Contact, WebUrl } from '../types';
import { isArrayOfType, isStringOrUndefined } from './basicTypeValidation';

const isWebUrl = (json: unknown): json is WebUrl => {
  if (!_isObjectLike(json)) {
    return false;
  }

  const { description, url } = json as WebUrl;

  return isStringOrUndefined(description) && isStringOrUndefined(url);
};

const isWebUrlsArrayOrUndefined = (json: unknown): json is WebUrl[] | undefined => {
  if (json === undefined) {
    return true;
  }

  return isArrayOfType(json, isWebUrl);
};

export const isContact = (json: unknown): json is Contact => {
  if (_isObjectLike(json)) {
    const { email, fax, firstName, lastName, phone, webUrls, www } = json as Contact;

    return (
      isStringOrUndefined(email) &&
      isStringOrUndefined(fax) &&
      isStringOrUndefined(firstName) &&
      isStringOrUndefined(lastName) &&
      isStringOrUndefined(phone) &&
      isWebUrlsArrayOrUndefined(webUrls) &&
      isStringOrUndefined(www)
    );
  }

  return false;
};
