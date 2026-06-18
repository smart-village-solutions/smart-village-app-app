import * as Notifications from 'expo-notifications';
import { useCallback, useContext } from 'react';

import { getNotificationNavigationTarget } from './helpers';
import { navigateToNotificationTarget } from './helpers/notificationNavigationHelper';
import { usePushNotifications, useWasteReminderSync } from './hooks';
import { SettingsContext } from './SettingsProvider';

export const WasteReminderRuntime = () => {
  const { globalSettings } = useContext(SettingsContext);
  const navigationType = globalSettings.navigation;

  const interactionHandler = useCallback(
    (response: Notifications.NotificationResponse) => {
      const data = response?.notification?.request?.content?.data || {};
      const navigationTarget = getNotificationNavigationTarget(data);

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.info(
          '[PushNotification][interaction]',
          JSON.stringify({ data, navigationTarget }, null, 2)
        );
      }

      if (!navigationTarget) {
        return;
      }

      navigateToNotificationTarget({ navigationTarget, navigationType });
    },
    [navigationType]
  );

  usePushNotifications(
    undefined,
    interactionHandler,
    undefined,
    globalSettings?.settings?.pushNotifications
  );
  useWasteReminderSync();

  return null;
};
