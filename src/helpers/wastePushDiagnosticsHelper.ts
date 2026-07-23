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
  typeof notification.content.data?.reminderKey === 'string';

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
      !Array.isArray(state?.scheduledReminderKeys)
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
      const payload = localState.serverSyncPayload;
      wasteConfiguration.selectedStreetConfigured = !!payload?.locationData?.street;
      wasteConfiguration.serverSyncPayloadPresent = !!payload;
      wasteConfiguration.serverSyncStatus = localState.serverSyncStatus;
      wasteConfiguration.usedTypeKeys = payload?.usedTypeKeys;
      wasteConfiguration.enabledTypeKeys = payload?.usedTypeKeys.filter(
        (key) => !!payload.notificationSettings[key]
      );
      wasteConfiguration.activeSlots = payload?.activeReminderRegistrations?.map(
        ({ active, leadDays, slotId, storeId, time, typeKey }) => ({
          typeKey,
          slotId,
          active,
          leadDays,
          time,
          serverStoreIdPresent: storeId !== undefined
        })
      );
      wasteConfiguration.localCoverageUntil = localState.localCoverageUntil;
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
    const {
      actualCount,
      attemptCount,
      errorClass,
      expectedCount,
      lastAttemptAt,
      nextRetryAt,
      reason,
      status
    } = localState.scheduling;
    scheduling.lastAttempt = {
      ...(actualCount === undefined ? {} : { actualCount }),
      attemptCount,
      ...(errorClass === undefined ? {} : { errorClass }),
      expectedCount,
      lastAttemptAt,
      ...(nextRetryAt === undefined ? {} : { nextRetryAt }),
      ...(reason === undefined ? {} : { reason }),
      status
    };
    scheduling.calculatedReminderCount = expectedCount;
    scheduling.successfullyScheduledCount = actualCount;
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
