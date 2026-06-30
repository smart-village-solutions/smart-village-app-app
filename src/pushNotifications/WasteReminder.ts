import * as SecureStore from 'expo-secure-store';

import * as appJson from '../../app.json';
import { device, secrets, staticRestSuffix, texts } from '../config';
import { formatWasteReminderTime } from '../helpers/wasteReminderTimeHelper';

import { ensurePushNotificationToken } from './PermissionHandling';
import {
  getPushTokenFromStorage,
  PushNotificationStorageKeys,
  serverConnectionAlert
} from './TokenHandling';
import { WasteReminderServerSyncPayload } from './WasteReminderLocalStorage';

const namespace = appJson.expo.slug as keyof typeof secrets;
const DEV_WASTE_REMINDER_PUSH_TOKEN = 'ExponentPushToken[dev-waste-reminder]';

type LocationData = {
  city: string;
  street: string;
  zip: string;
};

type SettingInfo = {
  localCoverageUntil?: Date;
  notifyDaysBefore?: number;
  reminderSlotId?: string;
  reminderTime: Date;
  wasteType?: string;
} & Partial<LocationData>;

type SyncActiveTypes = {
  [key: string]: {
    active: boolean;
    storeId?: string | number;
  };
};

type UpdateWasteReminderSettingsParams = {
  isActive: boolean;
  localCoverageUntil?: Date;
  locationData?: LocationData;
  onDayBefore?: boolean | number;
  reminderSlotId?: string;
  reminderTime: Date;
  storeId?: number | string;
  typeKey?: string;
};

type ReminderSyncResult = string | number | boolean | undefined;

type WasteReminderServerSyncActiveRegistration = NonNullable<
  WasteReminderServerSyncPayload['activeReminderRegistrations']
>[number];

const logWasteReminderServerRequest = (method: 'DELETE' | 'POST', payload: unknown) => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.info(`[WasteReminder][server ${method}]`, JSON.stringify(payload, null, 2));
};

const logWasteReminderServerDebug = (message: string, payload?: unknown) => {
  if (!__DEV__) {
    return;
  }

  // eslint-disable-next-line no-console
  console.info(
    `[WasteReminder][server] ${message}`,
    payload ? JSON.stringify(payload, null, 2) : ''
  );
};

const getStoredWasteReminderPushToken = () => getPushTokenFromStorage();

const getWasteReminderPushToken = async () => {
  const pushToken = await getPushTokenFromStorage();

  if (pushToken) {
    return pushToken;
  }

  const registeredToken = await ensurePushNotificationToken();

  if (registeredToken) {
    return registeredToken;
  }

  if (__DEV__) {
    logWasteReminderServerDebug('using generated DEV push token fallback');

    return DEV_WASTE_REMINDER_PUSH_TOKEN;
  }

  return undefined;
};

export const getReminderSettings = async () => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const pushToken = await getStoredWasteReminderPushToken();
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
  localCoverageUntil,
  notifyDaysBefore = 0,
  reminderSlotId,
  reminderTime,
  wasteType,
  city,
  street,
  zip
}: SettingInfo) => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const pushToken = await getWasteReminderPushToken();
  const requestPath = secrets[namespace].serverUrl + staticRestSuffix.wasteReminderRegister;
  const os =
    device.platform === 'ios' || device.platform === 'android' ? device.platform : 'undefined';
  const requestBody = {
    waste_registration: {
      ...(localCoverageUntil ? { local_coverage_until: localCoverageUntil.toISOString() } : {}),
      ...(reminderSlotId ? { reminder_slot_id: reminderSlotId } : {}),
      notify_at: formatTimeOfDay(reminderTime),
      notify_for_waste_type: wasteType,
      street,
      city,
      zip,
      notify_days_before: `${notifyDaysBefore}`
    },
    notification_device: {
      token: pushToken,
      device_type: os
    }
  };

  const fetchObj: RequestInit = {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      Authorization: 'Bearer ' + accessToken,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
    cache: 'no-cache'
  };

  if (accessToken && pushToken) {
    logWasteReminderServerRequest('POST', {
      ...requestBody,
      notification_device: {
        ...requestBody.notification_device,
        token: '[present]'
      }
    });

    try {
      const response = await fetch(requestPath, fetchObj);
      const json = await response.json();

      return json?.id as number | undefined;
    } catch {
      serverConnectionAlert(false);
      return undefined;
    }
  }

  logWasteReminderServerDebug('POST skipped: missing credentials', {
    hasAccessToken: !!accessToken,
    hasPushToken: !!pushToken,
    wasteType
  });
};

const deleteReminderSetting = async (id: number | string) => {
  const accessToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.ACCESS_TOKEN);
  const pushToken = await getWasteReminderPushToken();
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
    logWasteReminderServerRequest('DELETE', { id });

    try {
      const response = await fetch(requestPath, fetchObj);
      const isSuccess = response.ok || response.status === 404;

      if (!isSuccess) {
        serverConnectionAlert(isSuccess);
      }

      return isSuccess;
    } catch (error) {
      console.warn('An error occurred while deleting a reminder setting:', error);

      serverConnectionAlert(false, texts.errors.noData);
    }
  }

  logWasteReminderServerDebug('DELETE skipped: missing credentials', {
    hasAccessToken: !!accessToken,
    hasPushToken: !!pushToken,
    id
  });

  return false;
};

export const updateWasteReminderSettings = async ({
  isActive,
  localCoverageUntil,
  locationData,
  onDayBefore,
  reminderSlotId,
  reminderTime,
  storeId,
  typeKey
}: UpdateWasteReminderSettingsParams) => {
  if (!isActive && storeId) {
    return await deleteReminderSetting(storeId);
  }

  if (isActive) {
    return await updateReminderSettings({
      localCoverageUntil,
      notifyDaysBefore: getNotifyDaysBefore(onDayBefore),
      reminderSlotId,
      reminderTime,
      wasteType: typeKey,
      ...locationData
    });
  }
};

export const syncWasteReminderSettingsWithServer = async (
  payload: WasteReminderServerSyncPayload,
  localCoverageUntil?: Date
) => {
  logWasteReminderServerDebug('sync started', {
    activeReminderRegistrationsCount: payload.activeReminderRegistrations?.length,
    hasLocalCoverageUntil: !!localCoverageUntil,
    mode: payload.activeReminderRegistrations ? 'flexible' : 'legacy',
    usedTypeKeys: payload.usedTypeKeys
  });

  let errorOccurred = false;
  const resettedActiveTypes: SyncActiveTypes = {};
  const legacyReminderTime =
    payload.reminderTime instanceof Date ? payload.reminderTime : new Date(payload.reminderTime);

  if (payload.activeReminderRegistrations) {
    const syncResults = await Promise.all(
      payload.activeReminderRegistrations.map((registration) =>
        syncFlexibleReminderRegistration(registration, payload.locationData, localCoverageUntil)
      )
    );
    const activeReminderRegistrations = syncResults.map(({ registration }) => registration);
    errorOccurred = syncResults.some((result) => result.errorOccurred);

    activeReminderRegistrations.forEach((registration) => {
      const currentTypeState = resettedActiveTypes[registration.typeKey];

      if (registration.active) {
        resettedActiveTypes[registration.typeKey] = {
          active: true,
          storeId: registration.storeId ?? currentTypeState?.storeId
        };

        return;
      }

      if (!currentTypeState) {
        resettedActiveTypes[registration.typeKey] = { active: false };
      }
    });

    return {
      activeTypes: resettedActiveTypes,
      serverSyncPayload: {
        ...payload,
        activeReminderRegistrations
      },
      success: !errorOccurred
    };
  }

  await Promise.all(
    payload.usedTypeKeys.map(async (typeKey) => {
      const isActive = !!payload.notificationSettings[typeKey];
      const storeId = payload.activeTypes[typeKey]?.storeId;
      const newIdToStore = (await updateWasteReminderSettings({
        isActive,
        localCoverageUntil,
        locationData: payload.locationData,
        onDayBefore: payload.onDayBefore,
        reminderTime: legacyReminderTime,
        storeId,
        typeKey
      })) as ReminderSyncResult;

      resettedActiveTypes[typeKey] = { active: isActive };

      if (isActive && newIdToStore) {
        resettedActiveTypes[typeKey].storeId = newIdToStore as string | number;
      }

      if (isActive && !newIdToStore) {
        errorOccurred = true;
      }

      if (!isActive && storeId && newIdToStore !== true) {
        errorOccurred = true;
      }
    })
  );

  return {
    activeTypes: resettedActiveTypes,
    serverSyncPayload: {
      ...payload,
      activeTypes: resettedActiveTypes
    },
    success: !errorOccurred
  };
};

const syncFlexibleReminderRegistration = async (
  registration: WasteReminderServerSyncActiveRegistration,
  locationData: LocationData,
  localCoverageUntil?: Date
) => {
  if (registration.active && registration.storeId) {
    const deletedOldRegistration = await deleteReminderSetting(registration.storeId);

    if (!deletedOldRegistration) {
      return { errorOccurred: true, registration };
    }
  }

  const newIdToStore = (await updateWasteReminderSettings({
    isActive: registration.active,
    localCoverageUntil,
    locationData,
    onDayBefore: registration.leadDays,
    reminderSlotId: registration.slotId,
    reminderTime: buildReminderTimeDate(registration.time),
    storeId: registration.active ? undefined : registration.storeId,
    typeKey: registration.typeKey
  })) as ReminderSyncResult;

  return buildFlexibleReminderSyncResult(registration, newIdToStore);
};

const buildFlexibleReminderSyncResult = (
  registration: WasteReminderServerSyncActiveRegistration,
  newIdToStore: string | number | boolean | undefined
) => {
  const updatedRegistration = { ...registration };

  if (registration.active && newIdToStore) {
    updatedRegistration.storeId = newIdToStore as string | number;
  }

  if (!registration.active && newIdToStore === true) {
    delete updatedRegistration.storeId;
  }

  return {
    errorOccurred:
      (registration.active && !newIdToStore) ||
      (!registration.active && !!registration.storeId && newIdToStore !== true),
    registration: updatedRegistration
  };
};

const getNotifyDaysBefore = (onDayBefore?: boolean | number) => {
  if (typeof onDayBefore === 'number') {
    return Math.max(0, Math.floor(onDayBefore));
  }

  return onDayBefore ? 1 : 0;
};

const formatTimeOfDay = (date: Date) => formatWasteReminderTime(date);

const buildReminderTimeDate = (time: string) => {
  const [hours = '0', minutes = '0'] = time.split(':');
  const reminderTime = new Date('2000-01-01T00:00:00.000+01:00');

  reminderTime.setHours(Number(hours) || 0, Number(minutes) || 0, 0, 0);

  return reminderTime;
};
