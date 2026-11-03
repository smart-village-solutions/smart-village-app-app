import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers';
import { isJsonObject, JsonResponseError, readJsonResponse } from '../../helpers/jsonResponse';

export const requestsWithServiceRequestId = async (serviceRequestId: number) => {
  const { sueFetchObj = {}, sueRequestsUrlWithServiceId = '' } = await fetchSueEndpoints(
    serviceRequestId
  );

  const httpResponse = await fetch(`${sueRequestsUrlWithServiceId}`, sueFetchObj);
  // A missing/deleted report has no current status; preserve its stored status.
  if (httpResponse.status === 404 || httpResponse.status === 204) return null;

  const response = await readJsonResponse(httpResponse);
  if (!isJsonObject(response)) throw new JsonResponseError('shape', httpResponse.status);

  // convert media_url to JSON, as it is returned as a string by the API
  if (typeof response.media_url === 'string' && response.media_url) {
    try {
      response.media_url = JSON.parse(response.media_url);
    } catch {
      // Malformed optional media must not discard a valid report status.
      response.media_url = [];
    }
  }

  return new Promise((resolve) => {
    // return with converted keys to camelCase for being accessible per JavaScript convention
    resolve(_mapKeys(response, (value, key) => _camelCase(key)));
  });
};
