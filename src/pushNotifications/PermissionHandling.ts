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

export const setInAppPermission = async (newValue: boolean) => {
  let token = undefined;
  const oldValue = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

  if (newValue !== oldValue) {
    if (newValue) {
      // receive token
      token = await registerForPushNotificationsAsync();
    }

    // add token to store and notify server or
    // remove token from store and notify server
    const successfullyHandled = await handleIncomingToken(token);

    if (successfullyHandled) {
      if (!newValue) {
        try {
          await clearWasteReminderLocalNotifications();
        } catch (error) {
          console.warn(
            'An error occurred while clearing local waste reminder notifications:',
            error
          );
        }
      }

      await addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, newValue);
      DeviceEventEmitter.emit(PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT, newValue);
    }

    return successfullyHandled;
  }

  return true;
};

// https://docs.expo.dev/versions/latest/sdk/notifications/#expopushtokenoptions
const registerForPushNotificationsAsync = async () => {
  const { data: token } = await Notifications.getExpoPushTokenAsync({
    projectId: Constants.expoConfig?.extra?.eas.projectId
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

export const getLocalNotificationPermission = async (): Promise<boolean> => {
  await ensureDefaultNotificationChannel();

  if (!__DEV__ && !Device.isDevice) {
    return false;
  }

  const settings = await Notifications.getPermissionsAsync();

  return hasGrantedNotificationPermission(settings);
};

export const requestLocalNotificationPermission = async (): Promise<boolean> => {
  await ensureDefaultNotificationChannel();

  if (!__DEV__ && !Device.isDevice) {
    return false;
  }

  const existingSettings = await Notifications.getPermissionsAsync();

  if (hasGrantedNotificationPermission(existingSettings)) {
    return true;
  }

  const requestedSettings = await Notifications.requestPermissionsAsync();

  return hasGrantedNotificationPermission(requestedSettings);
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
  shouldSetInAppPermission = true
): Promise<boolean> => {
  // Push notifications do not work properly with simulators/emulators
  if (!Device.isDevice) {
    return false;
  }

  await ensureDefaultNotificationChannel();

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);
  // if in app permission is already set, do not request again
  const hasInAppPermissionSet = inAppPermission !== undefined && inAppPermission !== null;

  if (!hasInAppPermissionSet && existingStatus !== PermissionStatus.GRANTED) {
    const { status: requestedStatus } = await Notifications.requestPermissionsAsync();

    finalStatus = requestedStatus;
  }

  const isGranted = finalStatus === PermissionStatus.GRANTED;

  if (shouldSetInAppPermission && inAppPermission == null) {
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

export const updatePushToken = async () => {
  await handleSystemPermissions(false)
    .then((hasPermission) => {
      if (hasPermission) return registerForPushNotificationsAsync();
    })
    .then(handleIncomingToken);
};

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
