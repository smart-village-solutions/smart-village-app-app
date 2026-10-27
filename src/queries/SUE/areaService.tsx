import _uniq from 'lodash/uniq';

import { storageHelper } from '../../helpers/storageHelper';
import { withSueResourceCache } from '../../helpers/sueResourceCache';

import { fetchSueJson } from './submitRequest';

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

  return withSueResourceCache(['areaService', serverUrl, String(id)], async () => {
    const { rs } = await fetchSueJson(
      `${serverUrl}/${id}?selectAttributes=rs`,
      areaServiceFetchObj
    );
    const postalCodes = await fetchSueJson(
      `${serverUrl}/getByRs?rs=${rs}*&selectAttributes=postalCodes`,
      areaServiceFetchObj
    );

    return {
      postalCodes: _uniq(
        postalCodes?.values?.flatMap((item: { postalCodes?: string[] }) => item.postalCodes || [])
      )
    };
  });
};
