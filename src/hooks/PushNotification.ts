import * as Notifications from 'expo-notifications';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { readFromStore } from '../helpers';
import { getNotificationResponseKey } from '../helpers/notificationHelper';
import {
  PushNotificationStorageKeys,
  getPushTokenFromStorage,
  updatePushToken
} from '../pushNotifications';

type NotificationHandler = (arg: Notifications.Notification) => void;
type ResponseHandler = (arg: Notifications.NotificationResponse) => boolean | void;

export const usePushNotifications = (
  notificationHandler?: NotificationHandler,
  interactionHandler?: ResponseHandler,
  behavior?: Notifications.NotificationBehavior,
  active?: boolean
): void => {
  // this causes the active state to never change between rerenders.
  // like this enabling or disabling the pushNotifications requires an app restart.
  const [isActive] = useState(active);
  const lastNotificationResponse = Notifications.useLastNotificationResponse();

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const notificationHandlerRef = useRef(notificationHandler);
  const behaviorRef = useRef(behavior);
  const lastHandledNotificationKey = useRef<string | undefined>(undefined);

  const currentAppState = useRef<AppStateStatus | undefined>(undefined);

  useEffect(() => {
    notificationHandlerRef.current = notificationHandler;
    behaviorRef.current = behavior;
  }, [behavior, notificationHandler]);

  const onGetActive = useCallback(async (nextState: AppStateStatus) => {
    if (currentAppState.current !== nextState) {
      currentAppState.current = nextState;

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
    if (!lastNotificationResponse || !interactionHandler) return;

    const responseKey = getNotificationResponseKey(lastNotificationResponse);

    if (responseKey === lastHandledNotificationKey.current) return;

    try {
      const handled = interactionHandler(lastNotificationResponse);

      Notifications.clearLastNotificationResponse();
      lastHandledNotificationKey.current = responseKey;

      if (handled === false) {
        console.warn('Push notification response did not contain a supported navigation target.');
      }
    } catch (error) {
      // Keep the native response available so a remount can retry after a transient failure.
      console.warn('An error occurred while handling a push notification response:', error);
    }
  }, [interactionHandler, lastNotificationResponse]);

  useEffect(() => {
    if (isActive === false) return;

    Notifications.setNotificationHandler({
      handleNotification: async () =>
        behaviorRef.current ?? {
          shouldPlaySound: false,
          shouldSetBadge: false,
          shouldShowBanner: false,
          shouldShowList: false
        }
    });

    const subscription = AppState.addEventListener('change', onGetActive);

    // This listener is fired whenever a notification is received while the app is foregrounded
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      notificationHandlerRef.current?.(notification);
    });

    return () => {
      notificationListener.current && notificationListener.current.remove();

      subscription.remove();
    };
  }, [isActive, onGetActive]);
};
