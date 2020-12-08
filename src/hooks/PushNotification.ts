import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as Notifications from 'expo-notifications';
import { Subscription } from '@unimodules/react-native-adapter';

import { readFromStore } from '../helpers';
import {
  initializePushPermissions,
  PushNotificationStorageKeys,
  updatePushToken
} from '../pushNotifications';

type NotificationHandler = (arg: Notifications.Notification) => void;
type ResponseHandler = (arg: Notifications.NotificationResponse) => void;

export const usePushNotifications = (
  notificationHandler?: NotificationHandler,
  interactionHandler?: ResponseHandler,
  behavior?: Notifications.NotificationBehavior
): void => {
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();

  const [currentAppState, setCurrentAppState] = useState<AppStateStatus>();

  const onGetActive = useCallback(async (nextState: AppStateStatus) => {
    if (currentAppState !== nextState) {
      setCurrentAppState(nextState);

      // timeout is needed due to ios system push permission popup triggering appstate change
      // no timeout causes the onGetActive to fire an additional request to our server
      setTimeout(async () => {
        const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);

        if (nextState === 'active') {
          inAppPermission && updatePushToken();
        }
      }, 3000);
    }
  }, []); // empty dependencies because it will only used once in the "mountEffect" below

  useEffect(() => {
    initializePushPermissions();

    AppState.addEventListener('change', onGetActive);

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current =
      notificationHandler &&
      Notifications.addNotificationReceivedListener((notification) => {
        notificationHandler(notification);
      });

    // This listener is fired whenever a user taps on or interacts with a notification
    // (works when app is foregrounded, backgrounded, or killed)
    responseListener.current =
      interactionHandler &&
      Notifications.addNotificationResponseReceivedListener((response) => {
        interactionHandler(response);
      });

    Notifications.setNotificationHandler({
      handleNotification: async () =>
        behavior ?? {
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false
        }
    });

    return () => {
      notificationListener.current &&
        Notifications.removeNotificationSubscription(notificationListener.current);
      responseListener.current &&
        Notifications.removeNotificationSubscription(responseListener.current);
      AppState.removeEventListener('change', onGetActive);
    };
  }, []);
};
