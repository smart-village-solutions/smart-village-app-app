import { encounterApi } from '../config';
import { getEncounterUserId } from '../helpers';
import { parseUser } from '../jsonValidation';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.encounter.create;

export const createEncounterAsync = async (qrId: string) => {
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
  return;
};
