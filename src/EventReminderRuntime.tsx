import { useContext, useEffect } from 'react';
import { AppState } from 'react-native';

import { NetworkContext } from './NetworkProvider';
import {
  applyEventReminderUpdates,
  readEventReminders,
  refreshEventReminders
} from './pushNotifications/EventReminderLocalNotifications';
import { registerEventReminderRestoration } from './pushNotifications/LocalNotificationCapacity';
import { fetchEventReminderRecords } from './queries/eventReminderRecords';

export const EventReminderRuntime = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  useEffect(() => {
    const refresh = () => void refreshEventReminders().catch(() => undefined);
    const unregister = registerEventReminderRestoration(refresh);
    refresh();
    return unregister;
  }, []);

  useEffect(() => {
    let enabled = true;
    let syncing = false;
    const sync = async () => {
      if (syncing || !isConnected || !isMainserverUp) return;
      syncing = true;
      try {
        const reminders = Object.values(await readEventReminders());
        const ids = [...new Set(reminders.map(({ occurrence }) => occurrence.eventId))];
        const records = await fetchEventReminderRecords(ids);
        if (enabled && records.length) await applyEventReminderUpdates(records);
      } finally {
        syncing = false;
      }
    };
    const onActive = () => {
      void refreshEventReminders().catch(() => undefined);
      void sync().catch(() => undefined);
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') onActive();
    });
    if (AppState.currentState === 'active') void sync().catch(() => undefined);
    return () => {
      enabled = false;
      subscription.remove();
    };
  }, [isConnected, isMainserverUp]);

  return null;
};
