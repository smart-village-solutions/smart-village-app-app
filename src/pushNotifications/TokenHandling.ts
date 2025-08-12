import * as SecureStore from 'expo-secure-store';
import { Alert } from 'react-native';

import * as appJson from '../../app.json';
import { device, secrets, texts } from '../config';

const namespace = appJson.expo.slug as keyof typeof secrets;

export enum PushNotificationStorageKeys {
  ACCESS_TOKEN = 'ACCESS_TOKEN',
  PUSH_TOKEN = 'PUSH_TOKEN',
  IN_APP_PERMISSION = 'IN_APP_PERMISSION'
}

// will check if the incoming token is different from the stored one
// if it is different it will remove the old one from the server, if there was one present
// if it is different it will add the new one to the server if it is present
// in theory the token should be persistent, so we should never have
// two defined values that are distinct.
export const handleIncomingToken = async (token?: string) => {
  const storedToken = await getPushTokenFromStorage();

  if (storedToken !== (token ?? null)) {
    let successfullyRemoved = false;
    let successfullyAdded = false;

    if (storedToken) successfullyRemoved = await removeTokenFromServer(storedToken);
    if (token) successfullyAdded = await addTokenToServer(token);
    if (token ?? successfullyRemoved) storeTokenSecurely(token);

    // if we want to remove the token (token === undefined) then return if we did.
    // otherwise it is sufficient for the app to know that the new token has arrived on the server.
    return (!token && successfullyRemoved) || successfullyAdded;
  }

  // if the stored token and the new token coincide then there is nothing to do
  return true;
};

const removeTokenFromServer = async (token: string) => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const requestPath = secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesDelete;
  const fetchObj = {
    method: 'DELETE',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_device: { token }
    })
  };

  if (accessToken) {
    const response = await fetch(requestPath, fetchObj);

    // 204 means that it was a success on the server
    // 404 means that the token was already not on the server and can be treated as a success
    const isSuccess = response.status === 204 || response.status === 404;

    if (!isSuccess) {
      Alert.alert(texts.errors.errorTitle, texts.errors.noData);
    }

    return isSuccess;
  }

  return false;
};

const addTokenToServer = async (token: string) => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
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
      notification_device: { token, device_type: os }
    })
  };

  if (accessToken) {
    const response = await fetch(requestPath, fetchObj);

    // 201 means that it was a success on the server
    const isSuccess = response.status === 201;

    if (!isSuccess) {
      Alert.alert(texts.errors.errorTitle, texts.errors.noData);
    }

    return isSuccess;
  }

  return false;
};

const storeTokenSecurely = (token?: string) => {
  if (token) {
    SecureStore.setItemAsync(PushNotificationStorageKeys.PUSH_TOKEN, token);
  } else {
    SecureStore.deleteItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);
  }
};

export const getPushTokenFromStorage = () =>
  SecureStore.getItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);

export const addDataProvidersToTokenOnServer = async (excludeDataProviderIds: number[]) => {
  const storedToken = await getPushTokenFromStorage();
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const requestPath =
    secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesDataProviders;

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_device: { token: storedToken, exclude_data_provider_ids: excludeDataProviderIds }
    })
  };

  if (storedToken && accessToken) {
    return fetch(requestPath, fetchObj).then((response) => response.status === 200);
  }

  return false;
};

export const addMowasRegionalKeysToTokenOnServer = async (mowasRegionalKeys: number[]) => {
  const storedToken = await getPushTokenFromStorage();
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const requestPath =
    secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesDataProviders;

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_device: { token: storedToken, exclude_mowas_regional_keys: mowasRegionalKeys }
    })
  };

  if (storedToken && accessToken) {
    return fetch(requestPath, fetchObj).then((response) => response.status === 200);
  }

  return false;
};

export const addMemberIdToTokenOnServer = async (memberId?: number) => {
  const storedToken = await getPushTokenFromStorage();
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const requestPath =
    secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesDataProviders;

  const fetchObj = {
    method: 'PUT',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_device: { token: storedToken, member_id: memberId }
    })
  };

  if (storedToken && accessToken) {
    return fetch(requestPath, fetchObj).then((response) => response.status === 200);
  }

  return false;
};

export const togglePushDeviceAssignment = async (
  notificationPushableId: string,
  notificationPushableType: string,
  method: 'POST' | 'DELETE' = 'POST'
) => {
  const storedToken = await getPushTokenFromStorage();
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  let requestPath = secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesAddAssignment;

  if (method === 'DELETE') {
    requestPath =
      secrets[namespace].serverUrl + secrets[namespace].rest.pushDevicesRemoveAssignment;
  }

  const fetchObj = {
    method,
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      notification_push_device_assignment: {
        token: storedToken,
        notification_pushable_id: notificationPushableId,
        notification_pushable_type: notificationPushableType
      }
    })
  };

  if (storedToken && accessToken) {
    return fetch(requestPath, fetchObj).then((response) => response.status === 200);
  }

  return false;
};
