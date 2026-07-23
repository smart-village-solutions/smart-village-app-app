import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { PushNotificationStorageKeys } from './TokenHandling';
import { WasteReminderOccurrence, WasteReminderRegistration } from './WasteReminderScheduler';

export const WASTE_REMINDER_LOCAL_STORAGE_KEY = 'WASTE_REMINDER_LOCAL_STATE';

export type WasteReminderServerSyncPayload = {
  activeReminderRegistrations?: WasteReminderServerSyncRegistration[];
  activeTypes: {
    [key: string]: {
      active: boolean;
      storeId?: number | string;
    };
  };
  locationData?: {
    city?: string;
    street?: string;
    zip?: string;
  };
  notificationSettings: {
    [key: string]: boolean;
  };
  onDayBefore?: boolean;
  reminderTime: Date | string;
  usedTypeKeys: string[];
};

export type WasteReminderServerSyncRegistration = WasteReminderRegistration & {
  active: boolean;
};

export type WasteReminderLocalState = {
  localCoverageUntil?: string;
  ownerKey?: string;
  scheduledCoverageReminderNotificationIds?: string[];
  scheduledNotificationIds: string[];
  scheduledReminderKeys: string[];
  serverSyncPayload?: WasteReminderServerSyncPayload;
  serverSyncStatus?: 'pending' | 'synced';
};

export const readWasteReminderLocalState = async (): Promise<
  WasteReminderLocalState | undefined
> => {
  const storedState = await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY);

  if (!storedState) {
    return undefined;
  }

  try {
    return JSON.parse(storedState);
  } catch {
    await AsyncStorage.removeItem(WASTE_REMINDER_LOCAL_STORAGE_KEY);

    return undefined;
  }
};

export const writeWasteReminderLocalState = async (state: WasteReminderLocalState) =>
  AsyncStorage.setItem(WASTE_REMINDER_LOCAL_STORAGE_KEY, JSON.stringify(state));

export const removeWasteReminderLocalState = async () =>
  AsyncStorage.removeItem(WASTE_REMINDER_LOCAL_STORAGE_KEY);

export const getWasteReminderOwnerKey = async () => {
  const pushToken = await SecureStore.getItemAsync(PushNotificationStorageKeys.PUSH_TOKEN);

  return pushToken ? `push:${hashString(pushToken)}` : 'anonymous';
};

export const markWasteReminderServerSyncSynced = async (
  serverSyncPayload?: WasteReminderServerSyncPayload
) => {
  const currentState = await readWasteReminderLocalState();

  if (!currentState) {
    return;
  }

  await writeWasteReminderLocalState({
    ...currentState,
    serverSyncPayload: serverSyncPayload ?? currentState.serverSyncPayload,
    serverSyncStatus: 'synced'
  });
};

export const buildPendingWasteReminderState = ({
  localCoverageUntil,
  ownerKey,
  reminders,
  scheduledCoverageReminderNotificationIds = [],
  scheduledNotificationIds,
  serverSyncPayload,
  serverSyncStatus = 'pending'
}: {
  localCoverageUntil?: Date;
  ownerKey?: string;
  reminders: WasteReminderOccurrence[];
  scheduledCoverageReminderNotificationIds?: string[];
  scheduledNotificationIds: string[];
  serverSyncPayload: WasteReminderServerSyncPayload;
  serverSyncStatus?: NonNullable<WasteReminderLocalState['serverSyncStatus']>;
}): WasteReminderLocalState => ({
  localCoverageUntil: localCoverageUntil?.toISOString(),
  ownerKey,
  scheduledCoverageReminderNotificationIds,
  scheduledNotificationIds,
  scheduledReminderKeys: reminders.map((reminder) => reminder.id),
  serverSyncPayload,
  serverSyncStatus
});

const hashString = (value: string) => {
  const hashBuffer = new Int32Array(1);

  for (let index = 0; index < value.length; index += 1) {
    hashBuffer[0] = (hashBuffer[0] << 5) - hashBuffer[0] + (value.codePointAt(index) ?? 0);
  }

  return Math.abs(hashBuffer[0]).toString(36);
};
