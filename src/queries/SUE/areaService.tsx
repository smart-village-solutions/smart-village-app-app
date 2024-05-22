import { storageHelper } from '../../helpers';

export const areaService = async (zipCode: number) => {
  if (!zipCode) {
    return;
  }

  const globalSettings = await storageHelper.globalSettings();
  const { apiConfig = {} } = globalSettings?.settings?.sue || {};

  const { apiKey, serverUrl } = apiConfig.areaService || {};

  const areaServiceFetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  return await (
    await fetch(`${serverUrl}/getByPostalCode?postalCode=${zipCode}`, areaServiceFetchObj)
  ).json();
};
