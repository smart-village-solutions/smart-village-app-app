import { encounterApi } from '../config';
import { getEncounterUserId } from '../helpers';

const url = encounterApi.serverUrl + encounterApi.version + encounterApi.qr;

export const createQrCodeAsync = async (): Promise<string | undefined> => {
  const userId = await getEncounterUserId();

  if (!userId) {
    return;
  }

  const body = JSON.stringify({ user_id: userId });

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

  if (ok && status === 201 && typeof json?.qr_code_id === 'string') {
    return json.qr_code_id;
  }
};
