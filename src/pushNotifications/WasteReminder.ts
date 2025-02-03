import * as SecureStore from 'expo-secure-store';

import * as appJson from '../../app.json';
import { device, secrets, staticRestSuffix } from '../config';

import { getPushTokenFromStorage, PushNotificationStorageKeys } from './TokenHandling';

const namespace = appJson.expo.slug as keyof typeof secrets;

type LocationData =
  | {
      city: string;
      street: string;
      zip: string;
    }
  | undefined;

type SettingInfo = {
  onDayBefore?: boolean;
  reminderTime: Date;
  wasteType?: string;
} & Partial<LocationData>;

export const getReminderSettings = async () => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const pushToken = await getPushTokenFromStorage();
  const requestPath =
    secrets[namespace].serverUrl + staticRestSuffix.wasteReminderRegister + `?token=${pushToken}`;

  const fetchObj: RequestInit = {
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    cache: 'no-cache'
  };

  if (accessToken && pushToken) {
    return fetch(requestPath, fetchObj)
      .then((response) => {
        if (response.ok) {
          return response.json();
        }
      })
      .catch(() => {
        return undefined;
      });
  }

  return undefined;
};

const updateReminderSettings = async ({
  onDayBefore,
  reminderTime,
  wasteType,
  city,
  street,
  zip
}: SettingInfo) => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const pushToken = await getPushTokenFromStorage();
  const requestPath = secrets[namespace].serverUrl + staticRestSuffix.wasteReminderRegister;
  const os =
    device.platform === 'ios' || device.platform === 'android' ? device.platform : 'undefined';

  const fetchObj: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      waste_registration: {
        notify_at: `${reminderTime.getHours()}:${reminderTime.getMinutes()}+01:00`,
        notify_for_waste_type: wasteType,
        street,
        city,
        zip,
        notify_days_before: onDayBefore ? '1' : '0'
      },
      notification_device: {
        token: pushToken,
        device_type: os
      }
    }),
    cache: 'no-cache'
  };

  if (accessToken && pushToken) {
    try {
      const response = await fetch(requestPath, fetchObj);
      const json = await response.json();

      return json?.id as number | undefined;
    } catch {
      return undefined;
    }
  }
};

const deleteReminderSetting = async (id: number | string) => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const pushToken = await getPushTokenFromStorage();
  const requestPath =
    secrets[namespace].serverUrl +
    staticRestSuffix.wasteReminderDelete +
    `${id}.json?token=${pushToken}`;

  const fetchObj: RequestInit = {
    method: 'DELETE',
    headers: {
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    cache: 'no-cache'
  };

  if (accessToken && pushToken) {
    return fetch(requestPath, fetchObj)
      .then(() => {
        return true;
      })
      .catch((error) => {
        console.warn('An error occurred while deleting a reminder setting:', error);
        return false;
      });
  }

  return false;
};

export const updateWasteReminderSettings = async (
  isActive: boolean,
  reminderTime: Date,
  typeKey?: string,
  onDayBefore?: boolean,
  locationData?: LocationData,
  storeId?: number | string
) => {
  if (!isActive && storeId) {
    return await deleteReminderSetting(storeId);
  }

  if (isActive) {
    return await updateReminderSettings({
      onDayBefore,
      reminderTime,
      wasteType: typeKey,
      ...locationData
    });
  }
};
