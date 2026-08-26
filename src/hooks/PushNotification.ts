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
  const pushTokenListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Keep latest values available to listeners installed only once on mount.
  const notificationHandlerRef = useRef(notificationHandler);
  const interactionHandlerRef = useRef(interactionHandler);
  const behaviorRef = useRef(behavior);
  const lastHandledNotificationKey = useRef<string | undefined>(undefined);

  useEffect(() => {
    notificationHandlerRef.current = notificationHandler;
    interactionHandlerRef.current = interactionHandler;
    behaviorRef.current = behavior;
  }, [notificationHandler, interactionHandler, behavior]);

  const currentAppState = useRef<AppStateStatus | null>(null);

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

  const handleNotificationResponse = useCallback((response: Notifications.NotificationResponse) => {
    if (!interactionHandlerRef.current) return;

    const responseKey = getNotificationResponseKey(response);

    if (responseKey === lastHandledNotificationKey.current) return;

    try {
      const handled = interactionHandlerRef.current(response);

      Notifications.clearLastNotificationResponse();
      lastHandledNotificationKey.current = responseKey;

      if (handled === false) {
        console.warn('Push notification response did not contain a supported navigation target.');
      }
    } catch (error) {
      // Keep the native response available so a remount can retry after a transient failure.
      console.warn('An error occurred while handling a push notification response:', error);
    }
  }, []);

  useEffect(() => {
    if (lastNotificationResponse) {
      handleNotificationResponse(lastNotificationResponse);
    }
  }, [handleNotificationResponse, lastNotificationResponse]);

  useEffect(() => {
    const shouldHandlePushNotifications = isActive !== false;
    let subscription: ReturnType<typeof AppState.addEventListener> | undefined;

    if (shouldHandlePushNotifications) {
      Notifications.setNotificationHandler({
        handleNotification: async () =>
          behaviorRef.current ?? {
            shouldShowAlert: true,
            shouldPlaySound: false,
            shouldSetBadge: false,
            shouldShowBanner: __DEV__,
            shouldShowList: __DEV__
          }
      });

      subscription = AppState.addEventListener('change', onGetActive);

      // This listener is fired whenever a notification is received while the app is foregrounded
      notificationListener.current = Notifications.addNotificationReceivedListener(
        (notification) => {
          notificationHandlerRef.current?.(notification);
        }
      );
      pushTokenListener.current = Notifications.addPushTokenListener(() => {
        void updatePushToken().catch(() => {
          // eslint-disable-next-line no-console
          console.warn('An error occurred while refreshing the push notification token.');
        });
      });
    }

    // This listener is fired whenever a user taps on or interacts with a notification
    // while the app is foregrounded or backgrounded. This must stay active even when
    // remote push handling is disabled, because local notifications can still exist.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    return () => {
      notificationListener.current?.remove();
      pushTokenListener.current?.remove();
      responseListener.current?.remove();

      subscription?.remove();
    };
  }, [handleNotificationResponse, isActive, onGetActive]);
};
