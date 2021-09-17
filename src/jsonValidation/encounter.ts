import { isBoolean, isObjectLike, isString } from 'lodash';

import { User } from '../types';

type UserResponseType = {
  birth_date: string;
  first_name: string;
  image_uri: string;
  last_name: string;
  phone: string;
  verified: boolean;
};

export const parseUser = (json: unknown, userId: string): User | undefined => {
  if (!isObjectLike(json)) {
    return;
  }

  const user = {
    birthDate: (json as UserResponseType).birth_date,
    firstName: (json as UserResponseType).first_name,
    imageUri: (json as UserResponseType).image_uri,
    lastName: (json as UserResponseType).last_name,
    phone: (json as UserResponseType).phone,
    userId,
    verified: (json as UserResponseType).verified
  };

  return isUser(user) ? user : undefined;
};

export const isUser = (json: unknown): json is User => {
  if (!json) {
    return false;
  }

  return (
    isString((json as User).birthDate) && // TODO: check for proper date string?
    isString((json as User).firstName) &&
    isString((json as User).imageUri) &&
    isString((json as User).lastName) &&
    isString((json as User).phone) &&
    isString((json as User).userId) &&
    isBoolean((json as User).verified)
  );
};
