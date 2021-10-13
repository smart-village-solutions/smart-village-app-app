import { encounterApi } from '../config';
import { getEncounterUserId } from '../helpers';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.support.create;

export const createSupportIdAsync = async (): Promise<string | undefined> => {
  const userId = await getEncounterUserId();

  if (!userId) {
    return;
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

  if (ok && status === 200 && typeof json?.support_id === 'string') {
    return json.support_id;
  }
};
