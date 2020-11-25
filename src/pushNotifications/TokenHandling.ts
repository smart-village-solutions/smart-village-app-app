import * as SecureStore from 'expo-secure-store';

import { device, secrets } from '../config';
import * as appJson from '../../app.json';

const namespace = appJson.expo.slug as keyof typeof secrets;

export enum PushNotificationStorageKeys {
  PUSH_TOKEN = 'PUSH_TOKEN',
  IN_APP_PERMISSION = 'IN_APP_PERMISSION',
}

// will check if the incoming token is different from the stored one
// if it is different it will remove the old one from the server, if there was one present
// if it is different it will add the new one to the server if it is present
export const handleIncomingToken = async (token?: string) => {
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

const storeTokenSecurely = (token?: string) => {
  if (token) {
    SecureStore.setItemAsync(PushNotificationStorageKeys.PUSH_TOKEN, token);
  } else {
    SecureStore.deleteItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);
  }
};

const getTokenFromStorage = () =>
  SecureStore.getItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);

