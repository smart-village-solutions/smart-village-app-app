import { storageHelper } from '../helpers';

export const getWaterTemperature = async () => {
  const globalSettings = await storageHelper.globalSettings();
  const serverUrl = globalSettings?.settings?.waterTemperature?.serverUrl;
  const authSecret = globalSettings?.settings?.waterTemperature?.authSecret;

  const fetchObj = {
    method: 'GET',
    headers: { Authorization: authSecret }
  };

  return (await fetch(serverUrl, fetchObj)).json();
};
