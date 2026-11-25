import * as Notifications from 'expo-notifications';
import { useContext, useEffect, useMemo } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import {
  CategorySourceResult,
  EventReminderModes,
  EventReminderSettingsState
} from './helpers/eventReminderPlan';
import { NetworkContext } from './NetworkProvider';
import { SettingsContext } from './SettingsProvider';
import {
  EVENT_REMINDER_SUBSCRIPTIONS_CHANGED,
  applyEventCategorySourceResults,
  applyEventReminderUpdates,
  getEventReminderModes,
  readEventReminderSettings,
  recordEventReminderDelivery,
  refreshEventReminders
} from './pushNotifications/EventReminderLocalNotifications';
import { registerEventReminderRestoration } from './pushNotifications/LocalNotificationCapacity';
import {
  fetchEventCategorySnapshot,
  fetchEventReminderRecords
} from './queries/eventReminderRecords';

const eventIdsToVerify = (
  { singles, categoryPlan }: EventReminderSettingsState,
  results: CategorySourceResult[],
  { singleEnabled, categoryEnabled }: EventReminderModes
) => {
  const coveredIds = new Set(
    results.flatMap(({ snapshot }) => snapshot?.records.map(({ id }) => String(id)) ?? [])
  );
  const ids = new Set(
    Object.values(singleEnabled ? singles : {})
      .filter(({ completedAt }) => completedAt == null)
      .map(({ occurrence }) => occurrence.eventId)
  );
  for (const { occurrence, status } of Object.values(categoryEnabled ? categoryPlan : {})) {
    if (status === 'scheduled' && !coveredIds.has(occurrence.eventId)) ids.add(occurrence.eventId);
  }
  return [...ids];
};

const synchronizeReminderSources = async (
  online: boolean,
  modes: EventReminderModes,
  canApply: () => boolean
) => {
  const settings = await readEventReminderSettings();
  const results: CategorySourceResult[] = [];
  const subscriptions = modes.categoryEnabled
    ? Object.values(settings.subscriptions).filter(({ paused }) => !paused)
    : [];
  for (const { category, revision } of subscriptions) {
    if (!canApply()) return;
    const snapshot = online
      ? await fetchEventCategorySnapshot(category.id).catch(() => undefined)
      : undefined;
    results.push({ categoryId: category.id, revision, snapshot });
  }
  if (!canApply()) return;
  if (results.length) await applyEventCategorySourceResults(results, modes);
  if (!online || !canApply()) return;

  const records = await fetchEventReminderRecords(eventIdsToVerify(settings, results, modes));
  if (canApply() && records.length) await applyEventReminderUpdates(records, modes);
};

export const EventReminderRuntime = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { singleEnabled, categoryEnabled } = getEventReminderModes(globalSettings);
  const modes = useMemo(
    () => ({ singleEnabled, categoryEnabled }),
    [singleEnabled, categoryEnabled]
  );
  const enabled = singleEnabled || categoryEnabled;

  useEffect(() => {
    if (!singleEnabled) return;
    const subscription = Notifications.addNotificationReceivedListener(({ request }) => {
      void recordEventReminderDelivery(request.content.data).catch(() => undefined);
    });
    return () => subscription.remove();
  }, [singleEnabled]);

  useEffect(() => {
    const refresh = () => void refreshEventReminders(modes).catch(() => undefined);
    const unregister = enabled ? registerEventReminderRestoration(refresh) : undefined;
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    refresh();
    return () => {
      unregister?.();
      subscription.remove();
    };
  }, [enabled, modes]);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
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
        await synchronizeReminderSources(online, modes, () => active);
      } finally {
        syncing = false;
        if (syncRequested && active) {
          syncRequested = false;
          startSync();
        }
      }
    };
    const startSync = () => void sync().catch(() => undefined);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') startSync();
    });
    const configuration = DeviceEventEmitter.addListener(
      EVENT_REMINDER_SUBSCRIPTIONS_CHANGED,
      startSync
    );
    if (AppState.currentState === 'active') startSync();
    return () => {
      active = false;
      subscription.remove();
      configuration.remove();
    };
  }, [enabled, isConnected, isMainserverUp, modes]);

  return null;
};
