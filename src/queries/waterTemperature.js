import { storageHelper } from '../helpers';

export const getWaterTemperature = async () => {
  const globalSettings = await storageHelper.globalSettings();
  const serverUrl = globalSettings?.settings?.waterTemperature?.serverUrl;
  const authSecret = globalSettings?.settings?.waterTemperature?.authSecret;

  const fetchObj = {
    method: 'GET',
    headers: { Authorization: authSecret }
  };

  const response = await fetch(serverUrl, fetchObj);
  const status = response.status;
  const ok = response.ok;

  if (ok && status === 200) {
    return await response.json();
  }
};
