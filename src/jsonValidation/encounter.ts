import { isArray, isBoolean, isObjectLike, isString } from 'lodash';

import { Encounter, User, WelcomeInfo } from '../types';

type EncounterResponseType = {
  encounter_uuid: string;
  created_at: string;
};

type UserResponseType = {
  birth_date: string;
  first_name: string;
  image_uri: string;
  last_name: string;
  phone: string;
  verified: boolean;
};

const isUser = (json: unknown): json is Omit<User, 'userId'> => {
  if (!json) {
    return false;
  }

  return (
    isString((json as User).birthDate) && // TODO: check for proper date string?
    isString((json as User).firstName) &&
    isString((json as User).imageUri) &&
    isString((json as User).lastName) &&
    isString((json as User).phone) &&
    isBoolean((json as User).verified)
  );
};

export const parseUser = (json: unknown): User | undefined => {
  if (!isObjectLike(json)) {
    return;
  }

  const user = {
    birthDate: (json as UserResponseType).birth_date,
    firstName: (json as UserResponseType).first_name,
    imageUri: (json as UserResponseType).image_uri,
    lastName: (json as UserResponseType).last_name,
    phone: (json as UserResponseType).phone,
    verified: (json as UserResponseType).verified
  };

  if (!isUser(user)) {
    return;
  }

  return user;
};

const isEncounter = (json: unknown): json is Encounter => {
  return isString((json as Encounter).createdAt) && isString((json as Encounter).encounterId);
};

const parseEncounter = (json: unknown): Encounter | undefined => {
  if (!isObjectLike(json)) {
    return;
  }

  const encounter = {
    createdAt: (json as EncounterResponseType).created_at,
    encounterId: (json as EncounterResponseType).encounter_uuid
  };

  if (!isEncounter(encounter)) {
    return;
  }

  return encounter;
};

export const parseEncounters = (json: unknown): Encounter[] => {
  if (isArray(json)) {
    return json
      .map((value) => parseEncounter(value))
      .filter((encounter): encounter is Encounter => !!encounter);
  }

  return [];
};

const isWelcomeInfo = (json: unknown): json is WelcomeInfo =>
  isObjectLike(json) &&
  isString((json as WelcomeInfo).imageUrl) &&
  isString((json as WelcomeInfo).welcomeText) &&
  isString((json as WelcomeInfo).welcomeTitle);

export const parseEncounterWelcome = (json: unknown): WelcomeInfo => {
  if (!isWelcomeInfo(json)) {
    throw new Error('Error while parsing encounter welcome info');
  }

  return json;
};
