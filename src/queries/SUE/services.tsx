import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers/sueHelper';
import { withSueResourceCache } from '../../helpers/sueResourceCache';

import { fetchSueJson } from './submitRequest';

export const services = async () => {
  const { sueFetchObj = {}, sueServicesUrl = '' } = await fetchSueEndpoints();

  return withSueResourceCache([sueServicesUrl], async () => {
    const response = await fetchSueJson(sueServicesUrl, sueFetchObj);
    // return with converted keys to camelCase for being accessible per JavaScript convention
    return response.map((item: Record<string, unknown>) =>
      _mapKeys(item, (value, key) => _camelCase(key))
    );
  });
};
