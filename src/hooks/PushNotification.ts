import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { readFromStore } from '../helpers';
import {
  PushNotificationStorageKeys,
  getPushTokenFromStorage,
  updatePushToken
} from '../pushNotifications';

type NotificationHandler = (arg: Notifications.Notification) => void;
type ResponseHandler = (arg: Notifications.NotificationResponse) => void;

export const usePushNotifications = (
  notificationHandler?: NotificationHandler,
  interactionHandler?: ResponseHandler,
  behavior?: Notifications.NotificationBehavior,
  active?: boolean
): void => {
  // this causes the active state to never change between rerenders.
  // like this enabling or disabling the pushNotifications requires an app restart.
  const [isActive] = useState(active);

  if (isActive === false) return;

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const [currentAppState, setCurrentAppState] = useState<AppStateStatus>();

  const onGetActive = useCallback(async (nextState: AppStateStatus) => {
    if (currentAppState !== nextState) {
      setCurrentAppState(nextState);

      // timeout is needed due to ios system push permission popup triggering appstate change
      // no timeout causes the onGetActive to fire an additional request to our server
      setTimeout(async () => {
        const inAppPermission = await readFromStore(PushNotificationStorageKeys.IN_APP_PERMISSION);
        const token = await getPushTokenFromStorage();

        if (nextState === 'active' && inAppPermission && !token) {
          updatePushToken();
        }
      }, 3000);
    }
  }, []); // empty dependencies because it will only used once in the "mountEffect" below

  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () =>
        behavior ?? {
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false
        }
    });

    const subscription = AppState.addEventListener('change', onGetActive);

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = notificationHandler
      ? Notifications.addNotificationReceivedListener((notification) => {
          notificationHandler(notification);
        })
      : null;

    // This listener is fired whenever a user taps on or interacts with a notification
    // (works when app is foregrounded, backgrounded, or killed)
    responseListener.current = interactionHandler
      ? Notifications.addNotificationResponseReceivedListener((response) => {
          interactionHandler(response);
        })
      : null;

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();

      subscription.remove();
    };
  }, []);
};
