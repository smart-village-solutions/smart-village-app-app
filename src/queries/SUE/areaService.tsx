import { storageHelper } from '../../helpers';

export const areaService = async () => {
  const globalSettings = await storageHelper.globalSettings();
  const { apiConfig = {} } = globalSettings?.settings?.sue || {};

  const { apiKey, serverUrl, id } = apiConfig.areaService || {};

  const areaServiceFetchObj = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  return await (
    await fetch(`${serverUrl}/${id}?selectAttributes=postalCodes`, areaServiceFetchObj)
  ).json();
};
