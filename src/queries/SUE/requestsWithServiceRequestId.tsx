import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers';

export class SueRequestError extends Error {
  status: number;

  constructor(status: number) {
    super(`SUE request failed with HTTP ${status}`);
    this.name = 'SueRequestError';
    this.status = status;
  }
}

export const requestsWithServiceRequestId = async (serviceRequestId: number | string) => {
  const { sueFetchObj = {}, sueRequestsUrlWithServiceId = '' } = await fetchSueEndpoints(
    serviceRequestId
  );

  const result = await fetch(`${sueRequestsUrlWithServiceId}`, sueFetchObj);

  if (!result.ok) {
    throw new SueRequestError(result.status);
  }

  const response = await result.json();

  if (!response || typeof response !== 'object' || Array.isArray(response)) {
    throw new Error('Invalid SUE report response');
  }

  // convert media_url to JSON, as it is returned as a string by the API
  if (typeof response.media_url === 'string') {
    try {
      response.media_url = JSON.parse(response.media_url);
    } catch (error) {
      // A malformed attachment must not prevent a valid status from being refreshed.
      console.error('Error parsing media_url from SUE report response', error);
    }
  }

  // return with converted keys to camelCase for being accessible per JavaScript convention
  return _mapKeys(response, (value, key) => _camelCase(key));
};
