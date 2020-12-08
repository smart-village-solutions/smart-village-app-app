import * as SecureStore from 'expo-secure-store';

import { namespace, secrets } from './config';

/**
 * Check if a auth token is expired or still valid.
 * The expire time is saved as seconds from 01.01.1970 00:00:00 UTC, so
 * we need to divide Date.now() by 1000, which otherwise would return miliseconds.
 */
const isTokenValid = async () => {
  const accessTokenExpireTime = await SecureStore.getItemAsync('ACCESS_TOKEN_EXPIRE_TIME');

  if (!accessTokenExpireTime) return false;

  const now = parseInt(Date.now() / 1000, 10); // in seconds from 01.01.1970 00:00:00 UTC
  const expires = parseInt(accessTokenExpireTime, 10); // in seconds from 01.01.1970 00:00:00 UTC

  return now < expires;
};

/**
 * Requests the server to authenticate the mobile app with the main server.
 *
 * @param {requestCallback} callback the callback that needs authentication
 * @param {boolean} forceNewToken trigger to force request for new token, default `false`
 */
export const auth = async (callback, forceNewToken = false) => {
  // if the token is still valid, just run the callback, if one exists
  if (!forceNewToken && (await isTokenValid())) return callback && callback();

  // otherwise fetch a new access token and expire time
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
      // save the time when the token will expire, calculated from the creation time in seconds
      // added by the expire duration in seconds
      SecureStore.setItemAsync('ACCESS_TOKEN_EXPIRE_TIME', `${json.created_at + json.expires_in}`);
    })
    .finally(() => callback && callback());
};
