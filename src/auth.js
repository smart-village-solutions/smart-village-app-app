import * as SecureStore from 'expo-secure-store';

import appJson from '../app.json';
import { secrets } from './config';

export const auth = (callback) => {
  const namespace = appJson.expo.slug;

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: secrets[namespace].oAuthClientId,
      client_secret: secrets[namespace].oAuthClientSecret,
      grant_type: secrets[namespace].oAuthGrantType
    })
  };

  fetch(`${secrets[namespace].serverUrl}${secrets[namespace].oAuthTokenEndpoint}`, fetchObj)
    .then((res) => res.json())
    .then((json) => {
      SecureStore.setItemAsync('ACCESS_TOKEN', json.access_token);
    })
    .finally(() => callback && callback());
};
