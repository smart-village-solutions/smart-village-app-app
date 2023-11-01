import _camelCase from 'lodash/camelCase';
import _mapKeys from 'lodash/mapKeys';

import { sueFetchObj, sueRequestsUrl } from '../../helpers';

export const requests = async () => {
  const response = await (await fetch(`${sueRequestsUrl}`, sueFetchObj)).json();

  return new Promise((resolve) => {
    // return with converted keys to camelCase for being accessible per JavaScript convention
    resolve(
      response.map((item: any) => {
        // convert media_url to JSON, as it is returned as a string by the API
        if (item?.media_url) {
          item.media_url = JSON.parse(item.media_url);
        }

        return _mapKeys(item, (value, key) => _camelCase(key));
      })
    );
  });
};
