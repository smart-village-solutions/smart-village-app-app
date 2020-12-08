import * as SecureStore from 'expo-secure-store';

import { device, secrets } from '../config';
import * as appJson from '../../app.json';

const namespace = appJson.expo.slug as keyof typeof secrets;

export enum PushNotificationStorageKeys {
  PUSH_TOKEN = 'PUSH_TOKEN',
  IN_APP_PERMISSION = 'IN_APP_PERMISSION'
}

// will check if the incoming token is different from the stored one
// if it is different it will remove the old one from the server, if there was one present
// if it is different it will add the new one to the server if it is present
// in theory the token should be persistent, so we should never have
//  two defined values that are distinct.
export const handleIncomingToken = async (token?: string) => {
  const storedToken = await getTokenFromStorage();

  if (storedToken !== (token ?? null)) {
    let successfullyRemoved = false;
    let successfullyAdded = false;

    if (storedToken) successfullyRemoved = await removeTokenFromServer(storedToken);
    if (token) successfullyAdded = await addTokenToServer(token);
    storeTokenSecurely(token);
    // if we want to remove the token (token === undefined) then return if we did.
    // otherwise it is sufficient for the app to know that the new token has arrived on the server.
    return (!token && successfullyRemoved) || successfullyAdded;
  }
  // if the stored token and the new token coincide then there is nothing to do
  return true;
};

const removeTokenFromServer = async (token: string) => {
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');
  const requestPath = secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesDelete;
  const fetchObj = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      token
    })
  };

  if (accessToken)
    // 204 means that it was a success on the server
    // 404 means that the token was already not on the server and can be treated
    //  as a success
    return fetch(requestPath, fetchObj).then(
      (response) => response.status === 204 || response.status === 404
    );
  return false;
};

const addTokenToServer = async (token: string) => {
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');
  const requestPath = secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesRegister;
  const os =
    device.platform === 'ios' || device.platform === 'android' ? device.platform : 'undefined';

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_device: { token: token, device_type: os }
    })
  };
  if (accessToken) return fetch(requestPath, fetchObj).then((response) => response.status === 201);
  return false;
};

const storeTokenSecurely = (token?: string) => {
  if (token) {
    SecureStore.setItemAsync(PushNotificationStorageKeys.PUSH_TOKEN, token);
  } else {
    SecureStore.deleteItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);
  }
};

const getTokenFromStorage = () => SecureStore.getItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);
