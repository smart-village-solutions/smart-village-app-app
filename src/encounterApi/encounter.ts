import { encounterApi } from '../config';
import { getEncounterUserId } from '../helpers';
import { parseEncounters, parseUser } from '../jsonValidation';

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

  const json = await response.json();
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 201) {
    return parseUser(json);
  }
};

export const pollEncountersAsync = async () => {
  return;
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
