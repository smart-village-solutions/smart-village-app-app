import * as SecureStore from 'expo-secure-store';

import { namespace, secrets } from './config';

/**
 * SecureStore key holding the epoch second at which the current access token expires.
 */
const ACCESS_TOKEN_EXPIRE_TIME = 'ACCESS_TOKEN_EXPIRE_TIME';

/**
 * Check if a auth token is expired or still valid.
 * The expire time is saved as seconds from 01.01.1970 00:00:00 UTC, so
 * we need to divide Date.now() by 1000, which otherwise would return miliseconds.
 */
const isTokenValid = async () => {
  let accessTokenExpireTime = null;

  // The reason for the problem of staying in SplashScreen that occurs after the application is
  // updated on the Android side is the inability to obtain the token here.
  // For this reason, try/catch is used here and the problem of getting stuck in SplashScreen is solved.
  try {
    accessTokenExpireTime = await SecureStore.getItemAsync(ACCESS_TOKEN_EXPIRE_TIME);
  } catch {
    // Token deleted here so that it can be recreated
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_EXPIRE_TIME);
  }

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
/**
 * Ensures an access token exists before invoking the optional callback.
 */
export const auth = async (callback, forceNewToken = false) => {
  // if the token is still valid, just run the callback, if one exist, and quit
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

  const response = await fetch(
    `${secrets[namespace].serverUrl}${secrets[namespace].oAuthTokenEndpoint}`,
    fetchObj
  );
  const json = await response.json();

  await SecureStore.setItemAsync('ACCESS_TOKEN', json.access_token);
  // save the time when the token will expire, calculated from the creation time in seconds
  // added by the expire duration in seconds
  await SecureStore.setItemAsync(ACCESS_TOKEN_EXPIRE_TIME, `${json.created_at + json.expires_in}`);
};
