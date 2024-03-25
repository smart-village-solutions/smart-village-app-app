import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { fetchSueEndpoints } from '../../helpers';

export const priorities = async () => {
  const { sueFetchObj = {}, suePrioritiesUrl = '' } = await fetchSueEndpoints();

  const response = await (await fetch(`${suePrioritiesUrl}`, sueFetchObj)).json();

  return new Promise((resolve) => {
    // return with converted keys to camelCase for being accessible per JavaScript convention
    resolve(response.map((item: any) => _mapKeys(item, (value, key) => _camelCase(key))));
  });
};
