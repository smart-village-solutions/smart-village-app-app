import { encounterApi } from '../config';
import { getEncounterUserId } from '../helpers';
import { parseEncounters, parseUser, parseUsers } from '../jsonValidation';
import { User } from '../types';

export const createEncounterAsync = async (qrId: string) => {
  const url = encounterApi.serverUrl + encounterApi.version + encounterApi.encounter.create;
  const userId = await getEncounterUserId();

  if (!userId) {
    throw new Error('Error while loading encounter user id from storage.');
  }

  const body = JSON.stringify({ qr_code_id: qrId, user_id: userId });

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body
  });

  const status = response.status;
  const ok = response.ok;

  if (ok && status === 201) {
    const json = await response.json();

    return parseUser(json);
  }
};

export const pollEncountersAsync = async (userId: string, qrId: string): Promise<User[]> => {
  const url = encounterApi.serverUrl + encounterApi.version + encounterApi.encounter.poll;

  const response = await fetch(`${url}?user_id=${userId}&qr_code_id=${qrId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 200) {
    return parseUsers(json);
  }

  return [];
};

export const getEncountersAsync = async () => {
  const url = encounterApi.serverUrl + encounterApi.version + encounterApi.encounter.list;
  const userId = await getEncounterUserId();

  if (!userId) {
    throw new Error('Error while loading encounter user id from storage.');
  }

  const response = await fetch(`${url}?user_id=${userId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  });

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 200) {
    return parseEncounters(json) ?? [];
  }
};
