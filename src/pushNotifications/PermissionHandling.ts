import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { PermissionStatus } from 'expo-permissions';
import { Alert } from 'react-native';

import { colors, device, texts } from '../config';
import { parseColorToHex } from '../helpers/colorHelper';
import { addToStore, readFromStore } from '../helpers/storageHelper';

import { handleIncomingToken, PushNotificationStorageKeys } from './TokenHandling';

export const getInAppPermission = async (): Promise<boolean> => {
  return (await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION)) ?? false;
};

export const setInAppPermission = async (newValue: boolean) => {
  const oldValue = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

  if (newValue !== oldValue) {
    addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, newValue);

    if (newValue) {
      const hasPermission = await handleSystemPermissions();

      if (!hasPermission) {
        showSystemPermissionMissingDialog();

        return true;
      } else {
        const token = await registerForPushNotificationsAsync();
        const successfullyHandled = await handleIncomingToken(token);

        return successfullyHandled;
      }
    } else {
      // remove token from store and notify server
      const successfullyHandled = await handleIncomingToken();

      return successfullyHandled;
    }
  } else {
    return true;
  }
};

export const initializePushPermissions = async () => {
  const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

  inAppPermission && updatePushToken();

  // if inAppPermission is undefined (or null), set it depending on the system permission and trigger a token update
  if (inAppPermission === undefined || inAppPermission === null) {
    const hasPermission = await handleSystemPermissions();

    addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, hasPermission);

    hasPermission && updatePushToken();
  }
};

// https://docs.expo.dev/versions/latest/sdk/notifications/#expopushtokenoptions
const registerForPushNotificationsAsync = async () => {
  if (device.platform === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: parseColorToHex(colors.primary) ?? '#ffffff' // fall back to white if we can't make sense of the color value
    });
  }

  const { data: token } = await Notifications.getExpoPushTokenAsync();

  return token;
};

export const handleSystemPermissions = async (): Promise<boolean> => {
  // Push notifications do not work properly with simulators/emulators
  if (!Device.isDevice) return false;

  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  let finalStatus = existingStatus;

  if (existingStatus !== PermissionStatus.GRANTED) {
    const { status: requestedStatus } = await Notifications.requestPermissionsAsync();

    finalStatus = requestedStatus;
  }

  return finalStatus === PermissionStatus.GRANTED;
};

export const updatePushToken = async () => {
  await handleSystemPermissions()
    .then((hasPermission) => {
      if (hasPermission) return registerForPushNotificationsAsync();
    })
    .then(handleIncomingToken);
};

export const showSystemPermissionMissingDialog = () => {
  const { permissionMissingBody, permissionMissingTitle } = texts.pushNotifications;

  Alert.alert(permissionMissingTitle, permissionMissingBody, undefined);
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
        await setInAppPermission(true);
        approveCallback();
      }
    }
  ]);
};
