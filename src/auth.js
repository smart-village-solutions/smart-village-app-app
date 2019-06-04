import { SecureStore } from 'expo';

import { secrets } from './config';

export const auth = (callback) => {
  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      client_id: secrets.oAuthClientId,
      client_secret: secrets.oAuthClientSecret,
      grant_type: secrets.oAuthGrantType
    })
  };

  fetch(`${secrets.serverUrl}${secrets.oAuthTokenEndpoint}`, fetchObj)
    .then((res) => res.json())
    .then((json) => {
      SecureStore.setItemAsync('ACCESS_TOKEN', json.access_token);
    })
    .then(() => callback && callback());
};
