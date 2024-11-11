import _uniq from 'lodash/uniq';

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

  const rs = (
    await (await fetch(`${serverUrl}/${id}?selectAttributes=rs`, areaServiceFetchObj)).json()
  )?.rs;

  const postalCodes = await (
    await fetch(`${serverUrl}/getByRs?rs=${rs}*&selectAttributes=postalCodes`, areaServiceFetchObj)
  ).json();

  return {
    postalCodes: _uniq(postalCodes?.values?.flatMap((item: any) => item.postalCodes || []))
  };
};
