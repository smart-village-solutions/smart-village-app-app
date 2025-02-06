import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Alert, Linking } from 'react-native';

import { colors, device, texts } from '../config';
import { parseColorToHex } from '../helpers/colorHelper';
import { addToStore, readFromStore } from '../helpers/storageHelper';

import { handleIncomingToken, PushNotificationStorageKeys } from './TokenHandling';

const PermissionStatus = {
  DENIED: 'denied',
  GRANTED: 'granted',
  UNDETERMINED: 'undetermined'
};

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

    addToStore(PushNotificationStorageKeys.IN_APP_PERMISSION, newValue);

    // add token to store and notify server or
    // remove token from store and notify server
    const successfullyHandled = await handleIncomingToken(token);

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

export const handleSystemPermissions = async (
  shouldSetInAppPermission = true
): Promise<boolean> => {
  // Push notifications do not work properly with simulators/emulators
  if (!Device.isDevice) {
    return false;
  }

  if (device.platform === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: parseColorToHex(colors.primary) ?? '#ffffff' // fall back to white if we can't make sense of the color value
    });
  }

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

  if (shouldSetInAppPermission) {
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
  const { cancel, permissionMissingBody, permissionMissingTitle, settings } =
    texts.pushNotifications;

  Alert.alert(permissionMissingTitle, permissionMissingBody, [
    {
      text: cancel
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
