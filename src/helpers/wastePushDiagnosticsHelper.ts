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
  getWasteReminderOwnerKeyForToken,
  WASTE_REMINDER_SCHEDULING_ERROR_CLASSES,
  WASTE_REMINDER_SCHEDULING_REASONS,
  WASTE_REMINDER_SCHEDULING_STATUSES,
  WASTE_REMINDER_LOCAL_STORAGE_KEY,
  WasteReminderLocalState
} from '../pushNotifications/WasteReminderLocalStorage';

const WASTE_PUSH_DIAGNOSTICS_MAX_BYTES = 16 * 1024;
const WASTE_PUSH_DIAGNOSTICS_MAX_SCHEDULED_REMINDERS = 50;
const WASTE_PUSH_DIAGNOSTICS_MAX_VALUES_PER_REMINDER = 20;
const WASTE_STATE_VALIDATION_ERRORS = [
  'invalid-json',
  'invalid-state-shape',
  'missing-notification-ids',
  'missing-reminder-keys',
  'invalid-coverage',
  'invalid-server-sync-status',
  'invalid-server-sync-payload',
  'invalid-type-settings',
  'invalid-active-registration',
  'invalid-location',
  'invalid-scheduling'
] as const;

type WasteStateValidationError = (typeof WASTE_STATE_VALIDATION_ERRORS)[number];
type NonEmptyWasteStateValidationErrors = [
  WasteStateValidationError,
  ...WasteStateValidationError[]
];

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

const isOptionalCount = (value: unknown) => value === undefined || isCount(value);
const isOptionalIsoTimestamp = (value: unknown) => value === undefined || isIsoTimestamp(value);
const isOptionalSchedulingError = (value: unknown) =>
  value === undefined ||
  WASTE_REMINDER_SCHEDULING_ERROR_CLASSES.includes(
    value as (typeof WASTE_REMINDER_SCHEDULING_ERROR_CLASSES)[number]
  );
const isOptionalSchedulingReason = (value: unknown) =>
  value === undefined ||
  WASTE_REMINDER_SCHEDULING_REASONS.includes(
    value as (typeof WASTE_REMINDER_SCHEDULING_REASONS)[number]
  );

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
  const status = value.status as (typeof WASTE_REMINDER_SCHEDULING_STATUSES)[number];

  if (!WASTE_REMINDER_SCHEDULING_STATUSES.includes(status)) return undefined;
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
    if (enabled !== undefined && typeof enabled !== 'boolean') return undefined;
    if (enabled) enabledTypeKeys.push(typeKey);
  }

  return { usedTypeKeys, enabledTypeKeys };
};

const sanitizeLocation = (locationData: unknown) => {
  if (locationData === undefined) {
    return { valid: true as const, configured: false, location: undefined };
  }
  if (!isRecord(locationData)) return { valid: false as const };
  const limits = { city: 150, street: 300, zip: 20 } as const;
  const location: Record<string, string> = {};

  for (const [field, maxLength] of Object.entries(limits)) {
    const value = locationData[field];
    if (value === undefined) continue;
    if (!isBoundedString(value, maxLength)) return { valid: false as const };
    location[field] = value;
  }

  return {
    valid: true as const,
    configured: !!location.street,
    location: Object.keys(location).length ? location : undefined
  };
};

const sanitizeConfigurationPayload = (payload: unknown) => {
  if (!isRecord(payload)) return undefined;
  const typeSettings = sanitizeTypeSettings(payload.usedTypeKeys, payload.notificationSettings);
  if (!typeSettings) return undefined;
  const activeSlots = sanitizeActiveSlots(payload.activeReminderRegistrations);
  if (!activeSlots.valid) return undefined;
  const location = sanitizeLocation(payload.locationData);
  if (!location.valid) return undefined;

  return {
    ...typeSettings,
    ...(activeSlots.slots ? { activeSlots: activeSlots.slots } : {}),
    ...(location.location ? { location: location.location } : {}),
    selectedStreetConfigured: location.configured,
    wastePushEnabled: typeSettings.enabledTypeKeys.length > 0
  };
};

const sanitizeStringArray = (
  value: unknown,
  validator: (item: unknown) => item is string
): string[] | undefined => {
  if (!Array.isArray(value) || value.length > WASTE_PUSH_DIAGNOSTICS_MAX_VALUES_PER_REMINDER) {
    return undefined;
  }

  return value.every(validator) ? value : undefined;
};

const sanitizeScheduledReminder = (
  notification: Notifications.NotificationRequest
): Record<string, unknown> | undefined => {
  const data = notification.content.data;
  const pickupDates = sanitizeStringArray(
    data?.pickupDates,
    (value): value is string => isBoundedString(value, 10) && /^\d{4}-\d{2}-\d{2}$/.test(value)
  );
  const wasteTypeKeys = sanitizeStringArray(data?.wasteTypes, (value): value is string =>
    isBoundedString(value, 100)
  );
  const trigger = notification.trigger;
  const triggerDate = isRecord(trigger) ? trigger.date : undefined;
  const reminderDate =
    triggerDate instanceof Date ||
    typeof triggerDate === 'number' ||
    typeof triggerDate === 'string'
      ? new Date(triggerDate)
      : undefined;

  if (!pickupDates || !wasteTypeKeys || !reminderDate || Number.isNaN(reminderDate.getTime())) {
    return undefined;
  }

  return {
    reminderAt: reminderDate.toISOString(),
    pickupDates,
    wasteTypeKeys
  };
};

const sanitizeScheduledReminders = (notifications: Notifications.NotificationRequest[]) =>
  notifications
    .filter(isWasteReminderNotification)
    .map(sanitizeScheduledReminder)
    .filter((reminder): reminder is Record<string, unknown> => !!reminder)
    .slice(0, WASTE_PUSH_DIAGNOSTICS_MAX_SCHEDULED_REMINDERS);

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

const collectConfigurationValidationErrors = (
  state: WasteReminderLocalState
): WasteStateValidationError[] => {
  const errors: WasteStateValidationError[] = [];
  if (!isOptionalIsoTimestamp(state.localCoverageUntil)) errors.push('invalid-coverage');

  const payload = state.serverSyncPayload;
  if (!payload) return errors;

  if (!isValidServerSyncStatus(state.serverSyncStatus)) errors.push('invalid-server-sync-status');
  if (!isRecord(payload)) {
    errors.push('invalid-server-sync-payload');
    return errors;
  }
  if (!sanitizeTypeSettings(payload.usedTypeKeys, payload.notificationSettings)) {
    errors.push('invalid-type-settings');
  }
  if (!sanitizeActiveSlots(payload.activeReminderRegistrations).valid) {
    errors.push('invalid-active-registration');
  }
  if (!sanitizeLocation(payload.locationData).valid) errors.push('invalid-location');

  return errors;
};

const getOwnerState = ({
  currentOwner,
  localState,
  localStateStatus
}: {
  currentOwner?: string;
  localState?: WasteReminderLocalState;
  localStateStatus: 'missing' | 'valid' | 'corrupt' | 'unavailable';
}) => {
  if (localStateStatus === 'corrupt') return 'invalid-local-state';
  if (localStateStatus === 'missing') return 'no-local-state';
  if (localStateStatus === 'unavailable' || !localState) return 'unavailable';
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

type LocalStateDiagnosticResult =
  | { status: 'missing' }
  | { status: 'valid'; state: WasteReminderLocalState }
  | { status: 'corrupt'; errors: NonEmptyWasteStateValidationErrors };

const readLocalStateForDiagnostics = async (): Promise<LocalStateDiagnosticResult> => {
  const serialized = await AsyncStorage.getItem(WASTE_REMINDER_LOCAL_STORAGE_KEY);

  if (!serialized) return { status: 'missing' };

  try {
    const parsedState: unknown = JSON.parse(serialized);
    if (!isRecord(parsedState)) {
      return { status: 'corrupt', errors: ['invalid-state-shape'] };
    }
    const state = parsedState as WasteReminderLocalState;
    const errors: WasteStateValidationError[] = [];

    if (!Array.isArray(state.scheduledNotificationIds)) errors.push('missing-notification-ids');
    if (!Array.isArray(state.scheduledReminderKeys)) errors.push('missing-reminder-keys');
    errors.push(...collectConfigurationValidationErrors(state));
    if (state.scheduling !== undefined && !sanitizeScheduling(state.scheduling)) {
      errors.push('invalid-scheduling');
    }
    if (errors.length) {
      return { status: 'corrupt', errors: errors as NonEmptyWasteStateValidationErrors };
    }

    return { status: 'valid', state };
  } catch {
    return { status: 'corrupt', errors: ['invalid-json'] };
  }
};

const collectPermissionDiagnostics = async (collectionStatus: Record<string, 'failed'>) => {
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

  const results = await Promise.allSettled(permissionCollectors.map(([, collect]) => collect()));
  results.forEach((result, index) => {
    const name = permissionCollectors[index][0];
    if (result.status === 'fulfilled') permissions[name] = normalizePermission(result.value);
    else collectionStatus.permissions = 'failed';
  });

  return permissions;
};

const addSystemPermissionDiagnostic = (
  push: Record<string, unknown>,
  notificationPermission?: PermissionDiagnostic
) => {
  if (!notificationPermission) return;
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
};

const addAndroidChannelDiagnostic = (
  push: Record<string, unknown>,
  channelResult: PromiseSettledResult<Notifications.NotificationChannel | null | undefined>,
  collectionStatus: Record<string, 'failed'>
) => {
  if (Platform.OS !== 'android') return;
  if (channelResult.status === 'rejected') {
    collectionStatus.androidPushChannel = 'failed';
    return;
  }

  const channel = channelResult.value;
  push.defaultChannel = {
    exists: !!channel,
    ...(channel
      ? {
          importance: channel.importance,
          enableVibrate: channel.enableVibrate,
          bypassDnd: channel.bypassDnd,
          soundConfigured: !!channel.sound
        }
      : {})
  };
};

const addTokenDiagnostic = (
  push: Record<string, unknown>,
  tokenResult: PromiseSettledResult<string | null>,
  localState: WasteReminderLocalState | undefined,
  localStateStatus: 'missing' | 'valid' | 'corrupt' | 'unavailable',
  collectionStatus: Record<string, 'failed'>
) => {
  if (tokenResult.status === 'rejected') {
    collectionStatus.tokenOwner = 'failed';
    return;
  }

  const currentOwner = getWasteReminderOwnerKeyForToken(tokenResult.value);
  (push.token as Record<string, unknown>).present = !!tokenResult.value;
  (push.token as Record<string, unknown>).ownerState = getOwnerState({
    currentOwner,
    localState,
    localStateStatus
  });
};

const collectLocalStateDiagnostic = (
  localStateResult: PromiseSettledResult<LocalStateDiagnosticResult>,
  collectionStatus: Record<string, 'failed'>
) => {
  const wasteConfiguration: Record<string, unknown> = { localStateStatus: 'unavailable' };
  if (localStateResult.status === 'rejected') {
    collectionStatus.wasteState = 'failed';
    return { localState: undefined, localStateStatus: 'unavailable' as const, wasteConfiguration };
  }

  const diagnosticState = localStateResult.value;
  wasteConfiguration.localStateStatus = diagnosticState.status;
  if (diagnosticState.status === 'corrupt') {
    wasteConfiguration.localStateErrors = diagnosticState.errors;
  } else if (diagnosticState.status === 'valid') {
    Object.assign(wasteConfiguration, sanitizeConfiguration(diagnosticState.state));
  }

  return {
    localState: diagnosticState.status === 'valid' ? diagnosticState.state : undefined,
    localStateStatus: diagnosticState.status,
    wasteConfiguration
  };
};

export const collectWastePushDiagnostics = async () => {
  const collectionStatus: Record<string, 'failed'> = {};
  const permissions = await collectPermissionDiagnostics(collectionStatus);

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
  else collectionStatus.inAppPushSetting = 'failed';

  addSystemPermissionDiagnostic(push, permissions.notifications);
  addAndroidChannelDiagnostic(push, channelResult, collectionStatus);

  const { localState, localStateStatus, wasteConfiguration } = collectLocalStateDiagnostic(
    localStateResult,
    collectionStatus
  );

  addTokenDiagnostic(push, tokenResult, localState, localStateStatus, collectionStatus);

  const scheduling: Record<string, unknown> = {};
  if (localState?.scheduling) {
    const sanitizedScheduling = sanitizeScheduling(localState.scheduling);
    if (sanitizedScheduling) {
      const { actualCount, expectedCount, ...lastSchedulingAttempt } = sanitizedScheduling;

      scheduling.lastSchedulingAttempt = {
        ...lastSchedulingAttempt,
        calculatedCount: expectedCount,
        ...(actualCount === undefined ? {} : { verifiedScheduledCount: actualCount })
      };
    }
  }
  if (scheduledResult.status === 'fulfilled') {
    const scheduledReminders = sanitizeScheduledReminders(scheduledResult.value);

    scheduling.currentNativeInventory = {
      ...(scheduledReminders.length ? { scheduledReminders } : {}),
      scheduledWasteNotificationCount: scheduledResult.value.filter(isWasteReminderNotification)
        .length
    };
  } else collectionStatus.scheduledStore = 'failed';

  const result = {
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
