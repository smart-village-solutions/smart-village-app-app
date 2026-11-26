import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, DeviceEventEmitter, Linking } from 'react-native';

import { colors, device, texts } from '../config';
import { parseColorToHex } from '../helpers/colorHelper';
import { addToStore, readFromStore } from '../helpers/storageHelper';

import {
  getPushTokenFromStorage,
  handleIncomingToken,
  PushNotificationStorageKeys
} from './TokenHandling';
import { clearWasteReminderLocalNotifications } from './WasteReminderLocalNotifications';

const PermissionStatus = {
  DENIED: 'denied',
  GRANTED: 'granted',
  UNDETERMINED: 'undetermined'
};

export const PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT = 'pushNotificationPermissionChanged';

export const getInAppPermission = async (): Promise<boolean> => {
  return (await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION)) ?? false;
};

// Token refreshes and user permission changes must observe the same ordering.
let pendingPushOperation = Promise.resolve();
let preferenceRevision = 0;

const enqueuePushOperation = <T>(operation: () => Promise<T>): Promise<T> => {
  const result = pendingPushOperation.then(operation);

  pendingPushOperation = result.then(
    () => undefined,
    () => undefined
  );
  return result;
};

export const setInAppPermission = (newValue: boolean, registerRemote = true) =>
  enqueuePushOperation(() => applyInAppPermission(newValue, registerRemote));

const applyInAppPermission = async (newValue: boolean, registerRemote: boolean) => {
  const revision = preferenceRevision;
  let token = undefined;
  const oldValue = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

  if (newValue !== oldValue) {
    if (newValue && !registerRemote) {
      await addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, true);
      DeviceEventEmitter.emit(PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT, true);
      return true;
    }
    if (newValue) {
      // receive token
      token = await registerForPushNotificationsAsync();
    }

    // add token to store and notify server or
    // remove token from store and notify server
    const successfullyHandled = await handleIncomingToken(token);

    if (!successfullyHandled || revision !== preferenceRevision) return false;
    if (!newValue) await clearWasteNotifications();
    if (revision !== preferenceRevision) return false;
    await storeInAppPermission(newValue);
  }

  return true;
};

const storeInAppPermission = async (enabled: boolean) => {
  await addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, enabled);
  DeviceEventEmitter.emit(PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT, enabled);
};

const clearWasteNotifications = async () => {
  try {
    await clearWasteReminderLocalNotifications();
  } catch (error) {
    console.warn('An error occurred while clearing local waste reminder notifications:', error);
  }
};

export const setInAppPermissionForEventReminders = async (
  enabled: boolean,
  registerRemote: boolean
) => {
  const previous = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);
  ++preferenceRevision;
  await storeInAppPermission(enabled);
  if (registerRemote) {
    void syncInAppPushRegistration().catch(() => {
      console.warn('Could not synchronize remote push registration.');
    });
  }
  if (!enabled && previous) await clearWasteNotifications();
  return true;
};

// https://docs.expo.dev/versions/latest/sdk/notifications/#expopushtokenoptions
const registerForPushNotificationsAsync = async (
  devicePushToken?: Notifications.DevicePushToken
) => {
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas.projectId,
    ...(devicePushToken ? { devicePushToken } : {})
  });

  return token;
};

const ensureDefaultNotificationChannel = async () => {
  if (device.platform === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: __DEV__
        ? Notifications.AndroidImportance.HIGH
        : Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: parseColorToHex(colors.primary) ?? '#ffffff' // fall back to white if we can't make sense of the color value
    });
  }
};

const hasGrantedNotificationPermission = (
  settings: Notifications.NotificationPermissionsStatus
) => {
  return (
    settings.granted ||
    settings.status === PermissionStatus.GRANTED ||
    settings.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL
  );
};

const readSystemPermission = async (requestIfNeeded = false) => {
  const settings = await Notifications.getPermissionsAsync();
  if (hasGrantedNotificationPermission(settings)) return true;
  if (!requestIfNeeded || settings.canAskAgain === false) return false;
  return hasGrantedNotificationPermission(await Notifications.requestPermissionsAsync());
};

export const getLocalNotificationPermission = async (): Promise<boolean> => {
  await ensureDefaultNotificationChannel();

  if (!__DEV__ && !Device.isDevice) {
    return false;
  }

  return readSystemPermission();
};

export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  await ensureDefaultNotificationChannel();

  if (!__DEV__ && !Device.isDevice) {
    return false;
  }

  return readSystemPermission(true);
};

export const ensurePushNotificationToken = async () => {
  const storedToken = await getPushTokenFromStorage();

  if (storedToken) {
    return storedToken;
  }

  if (!Device.isDevice) {
    return undefined;
  }

  await ensureDefaultNotificationChannel();

  const { status } = await Notifications.getPermissionsAsync();

  if (status !== PermissionStatus.GRANTED) {
    return undefined;
  }

  const token = await registerForPushNotificationsAsync();
  const successfullyHandled = await handleIncomingToken(token);

  return successfullyHandled ? token : undefined;
};

export const handleSystemPermissions = async (
  shouldSetInAppPermission = true,
  requestIfNeeded = false
): Promise<boolean> => {
  if (device.platform !== 'ios' && device.platform !== 'android') {
    return false;
  }

  await ensureDefaultNotificationChannel();

  const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);
  const shouldInitialize = Device.isDevice && inAppPermission == null;
  const isGranted = await readSystemPermission(requestIfNeeded || shouldInitialize);

  if (shouldSetInAppPermission && shouldInitialize) {
    try {
      const successfullyHandledInAppPermission = await setInAppPermission(isGranted);

      return successfullyHandledInAppPermission && isGranted;
    } catch (error) {
      console.warn('An error occurred while handling in app permissions:', error);
      return false;
    }
  }

  return isGranted;
};

export const updatePushToken = (devicePushToken?: Notifications.DevicePushToken) =>
  enqueuePushOperation(async () => {
    // System permission alone does not authorize re-enabling an in-app opt-out.
    if (!(await getInAppPermission())) return false;

    const hasPermission = await handleSystemPermissions(false);
    const token = hasPermission
      ? await registerForPushNotificationsAsync(devicePushToken)
      : undefined;

    if (!(await getInAppPermission())) return false;
    return handleIncomingToken(token);
  });

export const syncInAppPushRegistration = () =>
  enqueuePushOperation(async () => {
    const permission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);
    if (permission !== true && permission !== false) return true;

    const storedToken = await getPushTokenFromStorage();
    if (!permission) {
      return !storedToken || handleIncomingToken(undefined, false);
    }
    if (storedToken) return true;
    if (!(await handleSystemPermissions(false))) return false;

    const token = await registerForPushNotificationsAsync();
    if (!(await getInAppPermission())) return false;
    return handleIncomingToken(token, false);
  });

export const showSystemPermissionMissingDialog = () => {
  const { abort, permissionMissingBody, permissionMissingTitle, settings } =
    texts.pushNotifications;

  Alert.alert(permissionMissingTitle, permissionMissingBody, [
    {
      text: abort,
      style: 'cancel'
    },
    {
      text: settings,
      onPress: () => Linking.openSettings()
    }
  ]);
};

export const showPermissionRequiredAlert = (approveCallback: () => void) => {
  const { abort, approve, permissionMissingTitle, permissionRequiredBody } =
    texts.pushNotifications;

  Alert.alert(permissionMissingTitle, permissionRequiredBody, [
    {
      text: abort,
      style: 'cancel'
    },
    {
      text: approve,
      onPress: async () => {
        const hasPermission = await handleSystemPermissions(false);

        if (!hasPermission) {
          showSystemPermissionMissingDialog();
        } else {
          await setInAppPermission(true);
          approveCallback();
        }
      }
    }
  ]);
};
