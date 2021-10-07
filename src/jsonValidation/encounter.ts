import { isBoolean, isString } from 'lodash';

import { User } from '../types';

export const isUser = (json: unknown): json is User => {
  if (!json) {
    return false;
  }

  return (
    isString((json as User).birthDate) && // TODO: check for proper date string?
    isString((json as User).createdAt) &&
    isString((json as User).firstName) &&
    isString((json as User).imageUri) &&
    isString((json as User).lastName) &&
    isString((json as User).phone) &&
    isString((json as User).userId) &&
    isBoolean((json as User).verified) &&
    isString((json as User).village)
  );
};
