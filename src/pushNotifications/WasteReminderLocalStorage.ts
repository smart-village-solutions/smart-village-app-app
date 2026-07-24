import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';

import { PushNotificationStorageKeys } from './TokenHandling';
import {
  WasteReminderOccurrence,
  WasteReminderRegistration,
  WasteReminderScheduleReason
} from './WasteReminderScheduler';

export const WASTE_REMINDER_LOCAL_STORAGE_KEY = 'WASTE_REMINDER_LOCAL_STATE';
export const WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY =
  'WASTE_REMINDER_PENDING_CANCELLATION_IDS';

export type WasteReminderServerSyncPayload = {
  disruptionRegistrations?: {
    [key in 'disruption_location' | 'disruption_all_locations']?: {
      active: boolean;
      storeId?: number | string;
    };
  };
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

export type WasteReminderSchedulingStatus =
  | 'scheduled'
  | 'permission-required'
  | 'failed'
  | 'no-future-reminders'
  | 'inactive'
  | 'waiting-for-data';

export type WasteReminderSchedulingErrorClass =
  | 'permission-denied'
  | 'channel-unavailable'
  | 'native-schedule-error'
  | 'native-verification-error'
  | 'native-verification-mismatch'
  | 'storage-error'
  | 'unknown';

export type WasteReminderSchedulingState = {
  actualCount?: number;
  attemptCount: number;
  errorClass?: WasteReminderSchedulingErrorClass;
  expectedCount: number;
  lastAttemptAt: string;
  nextRetryAt?: string;
  reason?: WasteReminderScheduleReason | 'data-unavailable';
  status: WasteReminderSchedulingStatus;
};

export type WasteReminderLocalState = {
  localCoverageUntil?: string;
  ownerKey?: string;
  reminderPlanFingerprint?: string;
  scheduledCoverageReminderNotificationIds?: string[];
  scheduledNotificationIds: string[];
  scheduledReminderKeys: string[];
  scheduling?: WasteReminderSchedulingState;
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

export const updateWasteReminderSchedulingState = async (
  scheduling: WasteReminderSchedulingState,
  stateUpdates: Partial<WasteReminderLocalState> = {}
) => {
  const currentState = await readWasteReminderLocalState();

  if (!currentState && !stateUpdates.serverSyncPayload) {
    return undefined;
  }

  const nextState = {
    scheduledNotificationIds: [],
    scheduledReminderKeys: [],
    ...currentState,
    ...stateUpdates,
    scheduling
  } as WasteReminderLocalState;

  await writeWasteReminderLocalState(nextState);

  return nextState;
};

export const removeWasteReminderLocalState = async () =>
  AsyncStorage.removeItem(WASTE_REMINDER_LOCAL_STORAGE_KEY);

export const readWasteReminderPendingCancellationIds = async () => {
  const storedIds = await AsyncStorage.getItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY);

  if (!storedIds) {
    return [];
  }

  try {
    const parsedIds = JSON.parse(storedIds);

    return Array.isArray(parsedIds)
      ? parsedIds.filter((notificationId): notificationId is string => {
          return typeof notificationId === 'string';
        })
      : [];
  } catch {
    await AsyncStorage.removeItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY);

    return [];
  }
};

export const writeWasteReminderPendingCancellationIds = async (notificationIds: string[]) => {
  const uniqueIds = Array.from(new Set(notificationIds));

  if (!uniqueIds.length) {
    await AsyncStorage.removeItem(WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY);
    return;
  }

  await AsyncStorage.setItem(
    WASTE_REMINDER_PENDING_CANCELLATION_STORAGE_KEY,
    JSON.stringify(uniqueIds)
  );
};

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
  reminderPlanFingerprint,
  reminders,
  scheduledCoverageReminderNotificationIds = [],
  scheduledNotificationIds,
  scheduling,
  serverSyncPayload,
  serverSyncStatus = 'pending'
}: {
  localCoverageUntil?: Date;
  ownerKey?: string;
  reminderPlanFingerprint?: string;
  reminders: WasteReminderOccurrence[];
  scheduledCoverageReminderNotificationIds?: string[];
  scheduledNotificationIds: string[];
  serverSyncPayload: WasteReminderServerSyncPayload;
  serverSyncStatus?: NonNullable<WasteReminderLocalState['serverSyncStatus']>;
  scheduling?: WasteReminderSchedulingState;
}): WasteReminderLocalState => ({
  localCoverageUntil: localCoverageUntil?.toISOString(),
  ownerKey,
  reminderPlanFingerprint,
  scheduledCoverageReminderNotificationIds,
  scheduledNotificationIds,
  scheduledReminderKeys: reminders.map((reminder) => reminder.id),
  ...(scheduling ? { scheduling } : {}),
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
