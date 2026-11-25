import { useContext, useEffect } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import { CategorySourceResult, EventReminderSettingsState } from './helpers/eventReminderPlan';
import { NetworkContext } from './NetworkProvider';
import {
  EVENT_REMINDER_SUBSCRIPTIONS_CHANGED,
  applyEventCategorySourceResults,
  applyEventReminderUpdates,
  readEventReminderSettings,
  refreshEventReminders
} from './pushNotifications/EventReminderLocalNotifications';
import { registerEventReminderRestoration } from './pushNotifications/LocalNotificationCapacity';
import {
  fetchEventCategorySnapshot,
  fetchEventReminderRecords
} from './queries/eventReminderRecords';

const eventIdsToVerify = (
  { singles, categoryPlan }: EventReminderSettingsState,
  results: CategorySourceResult[]
) => {
  const coveredIds = new Set(
    results.flatMap(({ snapshot }) => snapshot?.records.map(({ id }) => String(id)) ?? [])
  );
  const ids = new Set(Object.values(singles).map(({ occurrence }) => occurrence.eventId));
  for (const { occurrence, status } of Object.values(categoryPlan)) {
    if (status === 'scheduled' && !coveredIds.has(occurrence.eventId)) ids.add(occurrence.eventId);
  }
  return [...ids];
};

const synchronizeReminderSources = async (online: boolean, canApply: () => boolean) => {
  const settings = await readEventReminderSettings();
  const results: CategorySourceResult[] = [];
  for (const { category, revision } of Object.values(settings.subscriptions)) {
    if (!canApply()) return;
    const snapshot = online
      ? await fetchEventCategorySnapshot(category.id).catch(() => undefined)
      : undefined;
    results.push({ categoryId: category.id, revision, snapshot });
  }
  if (!canApply()) return;
  if (results.length) await applyEventCategorySourceResults(results);
  if (!online) return;

  const records = await fetchEventReminderRecords(eventIdsToVerify(settings, results));
  if (canApply() && records.length) await applyEventReminderUpdates(records);
};

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
    let syncRequested = false;
    const online = !!isConnected && !!isMainserverUp;
    const sync = async () => {
      if (syncing) {
        syncRequested = true;
        return;
      }
      syncing = true;
      try {
        await synchronizeReminderSources(online, () => enabled);
      } finally {
        syncing = false;
        if (syncRequested && enabled) {
          syncRequested = false;
          startSync();
        }
      }
    };
    const startSync = () => void sync().catch(() => undefined);
    const onActive = () => {
      void refreshEventReminders().catch(() => undefined);
      startSync();
    };
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') onActive();
    });
    const configuration = DeviceEventEmitter.addListener(
      EVENT_REMINDER_SUBSCRIPTIONS_CHANGED,
      startSync
    );
    if (AppState.currentState === 'active') startSync();
    return () => {
      enabled = false;
      subscription.remove();
      configuration.remove();
    };
  }, [isConnected, isMainserverUp]);

  return null;
};
