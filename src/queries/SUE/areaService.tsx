import { storageHelper } from '../../helpers';

export const areaService = async () => {
  const configurations = await storageHelper.configurations();
  const { sueConfig = {} } = configurations;
  const { apiConfig = {}, geoMap = {} } = sueConfig;

  const { apiKey, serverUrl } = apiConfig?.areaService || {};

  const id = geoMap?.areas?.[0]?.id || apiConfig?.areaService?.id;

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
