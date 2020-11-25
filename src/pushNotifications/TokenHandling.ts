import * as SecureStore from 'expo-secure-store';

import { device, secrets } from '../config';
import * as appJson from '../../app.json';

const namespace = appJson.expo.slug as keyof typeof secrets;

export enum PushNotificationStorageKeys {
    PUSH_TOKEN = 'PUSH_TOKEN',
    IN_APP_PERMISSION = 'IN_APP_PERMISSION',
}

export const handleIncomingToken = async (token?: string) => {
  // eslint-disable-next-line no-console
  console.log(token); // FIXME remove for production

  await getTokenFromStorage().then((result) => {
    if (result !== (token ?? null)) {
      if (result) removeTokenFromServer(result);
      if (token) addTokenToServer(token);
      storeTokenSecurely(token);
    }
  });
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

  if (accessToken) fetch(requestPath, fetchObj);
};

const addTokenToServer = async (token: string) => {
  const accessToken = await SecureStore.getItemAsync('ACCESS_TOKEN');
  const requestPath = secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesRegister;
  const os = device.platform === 'ios' || device.platform === 'android' 
    ? device.platform : 'undefined';

  const fetchObj = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      'notification_device': { 'token': token, 'device_type': os }
    })
  };
  if (accessToken) fetch(requestPath, fetchObj);
};

const storeTokenSecurely = async (token?: string) => {
  if (token) {
    return SecureStore.setItemAsync(PushNotificationStorageKeys.PUSH_TOKEN, token);
  } else {
    return SecureStore.deleteItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);
  }
};

const getTokenFromStorage = async () => {
  return SecureStore.getItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);
};
