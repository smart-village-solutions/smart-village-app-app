import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Calendar from 'expo-calendar';
import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import * as Notifications from 'expo-notifications';
import { PermissionResponse } from 'expo-modules-core';
import { Platform } from 'react-native';

import { getInAppPermission } from '../pushNotifications/PermissionHandling';
import { getPushTokenFromStorage } from '../pushNotifications/TokenHandling';
import {
  getWasteReminderOwnerKey,
  WASTE_REMINDER_LOCAL_STORAGE_KEY,
  WasteReminderLocalState
} from '../pushNotifications/WasteReminderLocalStorage';

const WASTE_PUSH_DIAGNOSTICS_MAX_BYTES = 16 * 1024;

export type PermissionDiagnostic = {
  status: 'granted' | 'denied' | 'undetermined' | 'limited' | 'unavailable';
  granted: boolean;
  canAskAgain?: boolean;
  expires?: string;
  platformDetails?: Record<string, boolean | number | string | null>;
};

const unavailable = (): PermissionDiagnostic => ({ status: 'unavailable', granted: false });

const isWasteReminderNotification = (notification: Notifications.NotificationRequest) =>
  notification.content.data?.query_type === 'WasteAddresses' &&
  !!notification.content.data?.reminderKey;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  !!value && typeof value === 'object' && !Array.isArray(value);

const isBoundedString = (value: unknown, maxLength = 200): value is string =>
  typeof value === 'string' && value.length <= maxLength;

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0;

const isIsoTimestamp = (value: unknown): value is string =>
  isBoundedString(value, 80) &&
  !Number.isNaN(Date.parse(value)) &&
  /^\d{4}-\d{2}-\d{2}T/.test(value);

const isReminderTime = (value: unknown): value is string => {
  if (!isBoundedString(value, 5) || !/^\d{2}:\d{2}$/.test(value)) return false;
  const [hours, minutes] = value.split(':').map(Number);

  return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59;
};

const SCHEDULING_STATUSES = [
  'scheduled',
  'permission-required',
  'failed',
  'no-future-reminders',
  'inactive',
  'waiting-for-data'
] as const;
const SCHEDULING_ERRORS = [
  'permission-denied',
  'channel-unavailable',
  'native-schedule-error',
  'native-verification-error',
  'native-verification-mismatch',
  'storage-error',
  'unknown'
] as const;
const SCHEDULING_REASONS = [
  'has-reminders',
  'no-active-types',
  'no-matching-waste-types',
  'no-pickup-dates',
  'no-future-reminders',
  'data-unavailable'
] as const;

const isOptionalCount = (value: unknown) => value === undefined || isCount(value);
const isOptionalIsoTimestamp = (value: unknown) => value === undefined || isIsoTimestamp(value);
const isOptionalSchedulingError = (value: unknown) =>
  value === undefined || SCHEDULING_ERRORS.includes(value as (typeof SCHEDULING_ERRORS)[number]);
const isOptionalSchedulingReason = (value: unknown) =>
  value === undefined || SCHEDULING_REASONS.includes(value as (typeof SCHEDULING_REASONS)[number]);

const hasValidRequiredSchedulingFields = ({
  attemptCount,
  expectedCount,
  lastAttemptAt
}: Record<string, unknown>) =>
  isCount(attemptCount) && isCount(expectedCount) && isIsoTimestamp(lastAttemptAt);

const hasValidOptionalSchedulingFields = ({
  actualCount,
  errorClass,
  nextRetryAt,
  reason
}: Record<string, unknown>) =>
  isOptionalCount(actualCount) &&
  isOptionalSchedulingError(errorClass) &&
  isOptionalIsoTimestamp(nextRetryAt) &&
  isOptionalSchedulingReason(reason);

const sanitizeScheduling = (value: unknown) => {
  if (!isRecord(value)) return undefined;
  const {
    actualCount,
    attemptCount,
    errorClass,
    expectedCount,
    lastAttemptAt,
    nextRetryAt,
    reason
  } = value;
  const status = value.status as (typeof SCHEDULING_STATUSES)[number];

  if (!SCHEDULING_STATUSES.includes(status)) return undefined;
  if (!hasValidRequiredSchedulingFields(value)) return undefined;
  if (!hasValidOptionalSchedulingFields(value)) return undefined;

  return {
    ...(actualCount === undefined ? {} : { actualCount }),
    attemptCount,
    ...(errorClass === undefined ? {} : { errorClass }),
    expectedCount,
    lastAttemptAt,
    ...(nextRetryAt === undefined ? {} : { nextRetryAt }),
    ...(reason === undefined ? {} : { reason }),
    status
  };
};

type SanitizedActiveSlot = {
  typeKey: string;
  slotId: string;
  active: boolean;
  leadDays: number;
  time: string;
  serverStoreIdPresent: boolean;
};

const sanitizeActiveSlot = (value: unknown): SanitizedActiveSlot | undefined => {
  if (!isRecord(value)) return undefined;
  if (!isBoundedString(value.typeKey, 100)) return undefined;
  if (!isBoundedString(value.slotId, 100)) return undefined;
  if (typeof value.active !== 'boolean') return undefined;
  if (!isCount(value.leadDays)) return undefined;
  if (!isReminderTime(value.time)) return undefined;
  const hasStoreId = value.storeId !== undefined;
  if (hasStoreId && typeof value.storeId !== 'string' && typeof value.storeId !== 'number') {
    return undefined;
  }

  return {
    typeKey: value.typeKey,
    slotId: value.slotId,
    active: value.active,
    leadDays: value.leadDays,
    time: value.time,
    serverStoreIdPresent: hasStoreId
  };
};

const sanitizeActiveSlots = (value: unknown) => {
  if (value === undefined) return { valid: true as const, slots: undefined };
  if (!Array.isArray(value)) return { valid: false as const };
  const slots = value.map(sanitizeActiveSlot);

  return slots.some((slot) => !slot)
    ? { valid: false as const }
    : { valid: true as const, slots: slots as SanitizedActiveSlot[] };
};

const sanitizeTypeSettings = (usedTypeKeysValue: unknown, settingsValue: unknown) => {
  if (!Array.isArray(usedTypeKeysValue)) return undefined;
  if (usedTypeKeysValue.length > 200) return undefined;
  if (!usedTypeKeysValue.every((key) => isBoundedString(key, 100))) return undefined;
  if (!isRecord(settingsValue)) return undefined;
  const usedTypeKeys = usedTypeKeysValue as string[];
  const enabledTypeKeys: string[] = [];
  for (const typeKey of usedTypeKeys) {
    const enabled = settingsValue[typeKey];
    if (typeof enabled !== 'boolean') return undefined;
    if (enabled) enabledTypeKeys.push(typeKey);
  }

  return { usedTypeKeys, enabledTypeKeys };
};

const getSelectedStreetConfigured = (locationData: unknown) => {
  if (locationData === undefined) return { valid: true as const, configured: false };
  if (!isRecord(locationData)) return { valid: false as const };
  if (locationData.street === undefined) return { valid: true as const, configured: false };
  if (!isBoundedString(locationData.street, 300)) return { valid: false as const };

  return { valid: true as const, configured: !!locationData.street };
};

const sanitizeConfigurationPayload = (payload: unknown) => {
  if (!isRecord(payload)) return undefined;
  const typeSettings = sanitizeTypeSettings(payload.usedTypeKeys, payload.notificationSettings);
  if (!typeSettings) return undefined;
  const activeSlots = sanitizeActiveSlots(payload.activeReminderRegistrations);
  if (!activeSlots.valid) return undefined;
  const street = getSelectedStreetConfigured(payload.locationData);
  if (!street.valid) return undefined;

  return {
    ...typeSettings,
    ...(activeSlots.slots ? { activeSlots: activeSlots.slots } : {}),
    selectedStreetConfigured: street.configured
  };
};

const isValidServerSyncStatus = (value: unknown) =>
  value === undefined || value === 'pending' || value === 'synced';

const sanitizeConfiguration = (state: WasteReminderLocalState) => {
  if (!isOptionalIsoTimestamp(state.localCoverageUntil)) return undefined;
  const payload = state.serverSyncPayload;
  if (!payload) {
    return {
      serverSyncPayloadPresent: false,
      ...(state.localCoverageUntil ? { localCoverageUntil: state.localCoverageUntil } : {})
    };
  }
  if (!isValidServerSyncStatus(state.serverSyncStatus)) return undefined;
  const sanitizedPayload = sanitizeConfigurationPayload(payload);
  if (!sanitizedPayload) return undefined;

  return {
    ...sanitizedPayload,
    serverSyncPayloadPresent: true,
    serverSyncStatus: state.serverSyncStatus,
    ...(state.localCoverageUntil ? { localCoverageUntil: state.localCoverageUntil } : {})
  };
};

const getOwnerState = ({
  currentOwner,
  localState
}: {
  currentOwner?: string;
  localState?: WasteReminderLocalState;
}) => {
  if (!localState) return 'no-local-state';
  if (!localState.ownerKey || localState.ownerKey === 'anonymous') return 'anonymous';
  if (!currentOwner || currentOwner === 'anonymous') return 'not-comparable';

  return localState.ownerKey === currentOwner
    ? 'matches-current-token'
    : 'differs-from-current-token';
};

const normalizePermission = (permission: PermissionResponse): PermissionDiagnostic => ({
  status:
    permission.status === 'granted' ||
    permission.status === 'denied' ||
    permission.status === 'undetermined'
      ? permission.status
      : 'limited',
  granted: permission.granted,
  canAskAgain: permission.canAskAgain,
  expires: String(permission.expires),
  ...((permission as Notifications.NotificationPermissionsStatus).android
    ? {
        platformDetails: {
          importance: (permission as Notifications.NotificationPermissionsStatus).android!
            .importance,
          ...((permission as Notifications.NotificationPermissionsStatus).android!
            .interruptionFilter !== undefined
            ? {
                interruptionFilter: (permission as Notifications.NotificationPermissionsStatus)
                  .android!.interruptionFilter!
              }
            : {})
        }
      }
    : {}),
  ...((permission as Notifications.NotificationPermissionsStatus).ios
    ? {
        platformDetails: {
          authorizationStatus: (permission as Notifications.NotificationPermissionsStatus).ios!
            .status,
          alert: (permission as Notifications.NotificationPermissionsStatus).ios!.allowsAlert,
          badge: (permission as Notifications.NotificationPermissionsStatus).ios!.allowsBadge,
          sound: (permission as Notifications.NotificationPermissionsStatus).ios!.allowsSound,
          lockScreen: (permission as Notifications.NotificationPermissionsStatus).ios!
            .allowsDisplayOnLockScreen,
          notificationCenter: (permission as Notifications.NotificationPermissionsStatus).ios!
            .allowsDisplayInNotificationCenter,
          banner: (permission as Notifications.NotificationPermissionsStatus).ios!.alertStyle
        }
      }
    : {})
});

const readLocalStateForDiagnostics = async (): Promise<{
  status: 'missing' | 'valid' | 'corrupt';
  state?: WasteReminderLocalState;
}> => {
  const serialized = await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY);

  if (!serialized) return { status: 'missing' };

  try {
    const state = JSON.parse(serialized) as WasteReminderLocalState;

    if (
      !Array.isArray(state?.scheduledNotificationIds) ||
      !Array.isArray(state?.scheduledReminderKeys) ||
      !sanitizeConfiguration(state) ||
      (state.scheduling !== undefined && !sanitizeScheduling(state.scheduling))
    ) {
      return { status: 'corrupt' };
    }

    return { status: 'valid', state };
  } catch {
    return { status: 'corrupt' };
  }
};

// Collection is deliberately isolated field-by-field, hence the orchestration branches.
// eslint-disable-next-line complexity
export const collectWastePushDiagnostics = async () => {
  const collectionStatus: Record<string, 'failed' | 'unsupported'> = {};
  const permissions: Record<string, PermissionDiagnostic> = {};
  const permissionCollectors: Array<[string, () => Promise<PermissionResponse>]> = [
    ['notifications', Notifications.getPermissionsAsync],
    ['locationForeground', Location.getForegroundPermissionsAsync],
    ['locationBackground', Location.getBackgroundPermissionsAsync],
    ['camera', Camera.getCameraPermissionsAsync],
    ['microphone', Camera.getMicrophonePermissionsAsync],
    ['mediaLibrary', MediaLibrary.getPermissionsAsync],
    ['calendar', Calendar.getCalendarPermissionsAsync]
  ];

  if (Platform.OS === 'ios') {
    permissionCollectors.push(['reminders', Calendar.getRemindersPermissionsAsync]);
  } else {
    permissions.reminders = unavailable();
  }

  const permissionResults = await Promise.allSettled(
    permissionCollectors.map(([, collect]) => collect())
  );
  permissionResults.forEach((result, index) => {
    const name = permissionCollectors[index][0];
    if (result.status === 'fulfilled') permissions[name] = normalizePermission(result.value);
    else collectionStatus.permissions = 'failed';
  });

  const [inAppResult, channelResult, tokenResult, localStateResult, scheduledResult] =
    await Promise.allSettled([
      getInAppPermission(),
      Platform.OS === 'android'
        ? Notifications.getNotificationChannelAsync('default')
        : Promise.resolve(undefined),
      getPushTokenFromStorage(),
      readLocalStateForDiagnostics(),
      Notifications.getAllScheduledNotificationsAsync()
    ]);

  const push: Record<string, unknown> = { token: {} };
  if (inAppResult.status === 'fulfilled') push.inAppEnabled = inAppResult.value;
  else collectionStatus.pushSettings = 'failed';

  const notificationPermission = permissions.notifications;
  if (notificationPermission) {
    const details = notificationPermission.platformDetails;
    push.systemPermission = {
      status: notificationPermission.status,
      granted: notificationPermission.granted,
      canAskAgain: notificationPermission.canAskAgain,
      ...(typeof details?.importance === 'number' ? { androidImportance: details.importance } : {}),
      ...(typeof details?.interruptionFilter === 'number'
        ? { androidInterruptionFilter: details.interruptionFilter }
        : {})
    };
  }
  if (channelResult.status === 'fulfilled') {
    const channel = channelResult.value;
    push.defaultChannel =
      Platform.OS === 'android'
        ? {
            exists: !!channel,
            ...(channel
              ? {
                  importance: channel.importance,
                  enableVibrate: channel.enableVibrate,
                  bypassDnd: channel.bypassDnd,
                  soundConfigured: !!channel.sound
                }
              : {})
          }
        : undefined;
  } else collectionStatus.pushSettings = 'failed';

  const wasteConfiguration: Record<string, unknown> = { localStateStatus: 'unavailable' };
  let localState: WasteReminderLocalState | undefined;
  if (localStateResult.status === 'fulfilled') {
    localState = localStateResult.value.state;
    wasteConfiguration.localStateStatus = localStateResult.value.status;
    if (localState) {
      Object.assign(wasteConfiguration, sanitizeConfiguration(localState));
    }
  } else collectionStatus.wasteState = 'failed';

  if (tokenResult.status === 'fulfilled') {
    const currentOwner = await getWasteReminderOwnerKey().catch(() => undefined);
    (push.token as Record<string, unknown>).present = !!tokenResult.value;
    (push.token as Record<string, unknown>).ownerState = getOwnerState({
      currentOwner,
      localState
    });
  } else collectionStatus.tokenOwner = 'failed';

  const scheduling: Record<string, unknown> = {};
  if (localState?.scheduling) {
    const sanitizedScheduling = sanitizeScheduling(localState.scheduling);
    if (sanitizedScheduling) {
      scheduling.lastAttempt = sanitizedScheduling;
      scheduling.calculatedReminderCount = sanitizedScheduling.expectedCount;
      scheduling.successfullyScheduledCount = sanitizedScheduling.actualCount;
    }
  }
  if (scheduledResult.status === 'fulfilled') {
    scheduling.nativeWasteNotificationCount = scheduledResult.value.filter(
      isWasteReminderNotification
    ).length;
  } else collectionStatus.scheduledStore = 'failed';

  const result = {
    schemaVersion: 1 as const,
    collectedAt: new Date().toISOString(),
    collectionStatus,
    permissions,
    push,
    wasteConfiguration,
    scheduling
  };
  const serialized = JSON.stringify(result);

  if (new TextEncoder().encode(serialized).length > WASTE_PUSH_DIAGNOSTICS_MAX_BYTES) {
    throw new Error('Waste push diagnostics exceed the allowed payload size');
  }

  return result;
};
