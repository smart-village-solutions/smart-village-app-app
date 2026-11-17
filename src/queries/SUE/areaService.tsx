import _uniq from 'lodash/uniq';

import { storageHelper } from '../../helpers';

const REQUEST_ABORTED = 'Area Service request aborted';

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

  const rs = (
    await (await fetch(`${serverUrl}/${id}?selectAttributes=rs`, areaServiceFetchObj)).json()
  )?.rs;

  if (signal?.aborted) throw new Error(REQUEST_ABORTED);

  const postalCodes = await (
    await fetch(`${serverUrl}/getByRs?rs=${rs}*&selectAttributes=postalCodes`, areaServiceFetchObj)
  ).json();

  if (signal?.aborted) throw new Error(REQUEST_ABORTED);

  return {
    postalCodes: _uniq(postalCodes?.values?.flatMap((item: any) => item.postalCodes || []))
  };
};
