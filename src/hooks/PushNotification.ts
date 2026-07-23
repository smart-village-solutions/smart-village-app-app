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

// Module-level variable to track the last handled cold-start notification.
// Persists across hook remounts within the same app session so the same tap
// cannot trigger duplicate navigation after a remount or navigator reset.
let lastHandledNotificationId: string | undefined;

export const usePushNotifications = (
  notificationHandler?: NotificationHandler,
  interactionHandler?: ResponseHandler,
  behavior?: Notifications.NotificationBehavior,
  active?: boolean
): void => {
  // this causes the active state to never change between rerenders.
  // like this enabling or disabling the pushNotifications requires an app restart.
  const [isActive] = useState(active);

  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Keep latest values available to listeners installed only once on mount.
  const notificationHandlerRef = useRef(notificationHandler);
  const interactionHandlerRef = useRef(interactionHandler);
  const behaviorRef = useRef(behavior);

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

  useEffect(() => {
    const shouldHandlePushNotifications = isActive !== false;
    let subscription: ReturnType<typeof AppState.addEventListener> | undefined;

    const handleNotificationResponse = (response: Notifications.NotificationResponse) => {
      const id = response.notification.request.identifier;

      if (id === lastHandledNotificationId) {
        return;
      }

      lastHandledNotificationId = id;
      interactionHandlerRef.current?.(response);
    };

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
    }

    // This listener is fired whenever a user taps on or interacts with a notification
    // while the app is foregrounded or backgrounded. This must stay active even when
    // remote push handling is disabled, because local notifications can still exist.
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      handleNotificationResponse
    );

    // Handle the cold-start case: when the app was killed and the user tapped a notification
    // to open it. In this case the response listener above never fires because the tap
    // happened before the listener was registered. getLastNotificationResponseAsync returns
    // the response that caused the app to open.
    if (interactionHandlerRef.current) {
      const lastResponse = Notifications.getLastNotificationResponse();
      if (lastResponse) {
        handleNotificationResponse(lastResponse);
      }
    }

    return () => {
      notificationListener.current && notificationListener.current.remove();
      responseListener.current && responseListener.current.remove();

      subscription?.remove();
    };
  }, [isActive, onGetActive]);
};
