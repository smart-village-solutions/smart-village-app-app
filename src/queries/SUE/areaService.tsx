import _uniq from 'lodash/uniq';

import { storageHelper } from '../../helpers';

const REQUEST_ABORTED = 'Area Service request aborted';

const fetchAreaServiceData = async (url: string, options: RequestInit) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`Area Service request failed (${response.status})`);
  return response.json();
};

export const areaService = async ({ signal }: { signal?: AbortSignal } = {}) => {
  const configurations = await storageHelper.configurations();
  if (signal?.aborted) throw new Error(REQUEST_ABORTED);
  const { sueConfig = {} } = configurations;
  const { apiConfig = {}, geoMap = {} } = sueConfig;

  const { apiKey, serverUrl } = apiConfig?.areaService || {};

  const id = geoMap?.areas?.[0]?.id || apiConfig?.areaService?.id;

  const areaServiceFetchObj = {
    method: 'GET',
    signal,
    headers: {
      accept: 'application/json',
      api_key: apiKey
    }
  };

  const { rs } = await fetchAreaServiceData(
    `${serverUrl}/${id}?selectAttributes=rs`,
    areaServiceFetchObj
  );
  if (!rs) throw new Error('Area Service response is missing its region code');

  if (signal?.aborted) throw new Error(REQUEST_ABORTED);

  const postalCodes = await fetchAreaServiceData(
    `${serverUrl}/getByRs?rs=${rs}*&selectAttributes=postalCodes`,
    areaServiceFetchObj
  );
  if (!Array.isArray(postalCodes?.values)) {
    throw new TypeError('Area Service response is missing its postcode list');
  }

  if (signal?.aborted) throw new Error(REQUEST_ABORTED);

  return {
    postalCodes: _uniq(postalCodes?.values?.flatMap((item: any) => item.postalCodes || []))
  };
};
