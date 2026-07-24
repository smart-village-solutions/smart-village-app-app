import { useCallback, useContext, useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import { NetworkContext } from '../NetworkProvider';
import {
  migrateWasteReminderLocalStateToCurrentOwner,
  getReminderSettings,
  getWasteReminderOwnerKey,
  getInAppPermission,
  markWasteReminderServerSyncSynced,
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
  PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT,
  reportWasteReminderMaintenanceSync,
  readWasteReminderLocalState,
  rescheduleWasteReminderNotificationsFromLocalState,
  retryPendingWasteReminderNotificationCancellations,
  syncWasteReminderSettingsWithServer,
  updateWasteReminderSchedulingState,
  verifyWasteReminderNotificationsFromLocalState,
  writeWasteReminderLocalState
} from '../pushNotifications';
import { getLocationData } from '../screens';
import { SettingsContext } from '../SettingsProvider';

import { useStreetString, useWasteStreet, useWasteTypes, useWasteUsedTypes } from './waste';

export const WASTE_REMINDER_MANUAL_RETRY_EVENT = 'wasteReminderManualRetry';
export const WASTE_REMINDER_SCHEDULING_STATUS_CHANGED_EVENT =
  'wasteReminderSchedulingStatusChanged';

export const requestWasteReminderManualRetry = () => {
  DeviceEventEmitter.emit(WASTE_REMINDER_MANUAL_RETRY_EVENT);
};

type WasteReminderMaintenanceTrigger =
  | 'startup'
  | 'data-ready'
  | 'foreground'
  | 'permission-change'
  | 'token-change'
  | 'manual-retry';

export const useWasteReminderSync = () => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const selectedStreetId = globalSettings.waste?.streetId;
  const { data: streetData, loading: streetLoading } = useWasteStreet({ selectedStreetId });
  const { data: typesData, loading: typesLoading } = useWasteTypes();
  const usedTypes = useWasteUsedTypes({ streetData, typesData });
  const { getStreetString } = useStreetString();
  const hasRefreshedLocalNotificationsInitially = useRef(false);
  const maintenanceQueue = useRef(Promise.resolve());

  const syncPendingWasteReminderSettings = useCallback(async () => {
    if (!isConnected || !isMainserverUp) {
      return;
    }

    const localState = await readWasteReminderLocalState();

    if (localState?.serverSyncStatus !== 'pending' || !localState.serverSyncPayload) {
      return;
    }

    const { serverSyncPayload, success } = await syncWasteReminderSettingsWithServer(
      localState.serverSyncPayload,
      localState.localCoverageUntil ? new Date(localState.localCoverageUntil) : undefined
    );

    if (success) {
      await markWasteReminderServerSyncSynced(serverSyncPayload);
      reportWasteReminderMaintenanceSync('synced');
    } else {
      reportWasteReminderMaintenanceSync('failed-pending');
    }
  }, [isConnected, isMainserverUp]);

  const refreshLocalWasteReminderNotifications = useCallback(async () => {
    if (streetLoading || typesLoading || !streetData || !usedTypes) {
      const localState = await readWasteReminderLocalState();

      if (localState?.serverSyncPayload && localState.scheduling?.status !== 'waiting-for-data') {
        await updateWasteReminderSchedulingState({
          attemptCount: 0,
          expectedCount: localState.scheduling?.expectedCount ?? 0,
          lastAttemptAt: new Date().toISOString(),
          reason: 'data-unavailable',
          status: 'waiting-for-data'
        });
      }

      return;
    }

    const locationData = getLocationData(streetData);
    const streetName = locationData ? getStreetString(locationData) : undefined;

    await rescheduleWasteReminderNotificationsFromLocalState({
      streetName,
      wasteLocationTypes: streetData?.wasteAddresses?.[0]?.wasteLocationTypes,
      wasteTypesData: usedTypes
    });
  }, [getStreetString, streetData, streetLoading, typesLoading, usedTypes]);

  const reconstructCurrentOwnerSettings = useCallback(async () => {
    if (streetLoading || typesLoading || !streetData || !usedTypes) {
      return false;
    }

    const fetchResult = await getReminderSettings();
    const locationData = getLocationData(streetData);

    if (fetchResult.status !== 'ok' || !locationData) {
      await writeWasteReminderLocalState({
        ownerKey: await getWasteReminderOwnerKey(),
        scheduledNotificationIds: [],
        scheduledReminderKeys: [],
        scheduling: {
          attemptCount: 0,
          expectedCount: 0,
          lastAttemptAt: new Date().toISOString(),
          reason: 'data-unavailable',
          status: 'waiting-for-data'
        }
      });
      return false;
    }

    const settings = fetchResult.settings.filter(
      ({ city, street, zip, notify_for_waste_type: typeKey }) =>
        city === locationData.city &&
        street === locationData.street &&
        zip === locationData.zip &&
        !!usedTypes[typeKey]
    );
    const registrations = settings.map((setting) => ({
      active: true,
      leadDays: setting.notify_days_before,
      slotId: setting.reminder_slot_id ?? 'default',
      storeId: setting.id,
      time: new Date(setting.notify_at).toLocaleTimeString('de-DE', {
        hour: '2-digit',
        hour12: false,
        minute: '2-digit'
      }),
      typeKey: setting.notify_for_waste_type
    }));
    const notificationSettings = Object.fromEntries(
      Object.keys(usedTypes).map((typeKey) => [
        typeKey,
        registrations.some((registration) => registration.typeKey === typeKey)
      ])
    );
    const activeTypes = Object.fromEntries(
      Object.keys(usedTypes).map((typeKey) => {
        const registration = registrations.find((item) => item.typeKey === typeKey);
        return [typeKey, { active: !!registration, storeId: registration?.storeId }];
      })
    );

    await writeWasteReminderLocalState({
      ownerKey: await getWasteReminderOwnerKey(),
      scheduledNotificationIds: [],
      scheduledReminderKeys: [],
      scheduling: {
        attemptCount: 0,
        expectedCount: 0,
        lastAttemptAt: new Date().toISOString(),
        status: registrations.length ? 'waiting-for-data' : 'inactive'
      },
      serverSyncPayload: {
        activeReminderRegistrations: registrations,
        activeTypes,
        locationData,
        notificationSettings,
        reminderTime: registrations[0]?.time ?? '2000-01-01T09:00:00.000+01:00',
        usedTypeKeys: Object.keys(usedTypes)
      },
      serverSyncStatus: 'synced'
    });

    return true;
  }, [streetData, streetLoading, typesLoading, usedTypes]);

  // The branches mirror the persisted maintenance state machine and stay centralized so every
  // trigger observes the same ordering and backoff rules.
  // eslint-disable-next-line complexity
  const enqueueWasteReminderMaintenance = useCallback(
    (trigger: WasteReminderMaintenanceTrigger) => {
      maintenanceQueue.current = maintenanceQueue.current
        .catch(() => undefined)
        // eslint-disable-next-line complexity
        .then(async () => {
          await retryPendingWasteReminderNotificationCancellations().catch(() => undefined);
          const hasInAppPermission = await getInAppPermission();

          if (!hasInAppPermission) {
            return;
          }

          const ownerResult = await migrateWasteReminderLocalStateToCurrentOwner();
          if (ownerResult === 'deferred-no-token') {
            reportWasteReminderMaintenanceSync('skipped-no-token');
            return;
          }
          let stateBeforeAttempt = await readWasteReminderLocalState();
          if (
            !stateBeforeAttempt?.serverSyncPayload &&
            stateBeforeAttempt?.scheduling?.status === 'waiting-for-data'
          ) {
            const reconstructed = await reconstructCurrentOwnerSettings();
            if (!reconstructed) {
              return;
            }
            stateBeforeAttempt = await readWasteReminderLocalState();
          }

          const nextRetryAt = stateBeforeAttempt?.scheduling?.nextRetryAt;
          const isRetryDue = !nextRetryAt || new Date(nextRetryAt).getTime() <= Date.now();
          const bypassBackoff =
            trigger === 'manual-retry' ||
            trigger === 'permission-change' ||
            trigger === 'token-change' ||
            ownerResult === 'migrated' ||
            (trigger === 'foreground' &&
              stateBeforeAttempt?.scheduling?.status === 'permission-required') ||
            (trigger === 'data-ready' &&
              stateBeforeAttempt?.scheduling?.status === 'waiting-for-data');

          if (
            stateBeforeAttempt?.scheduling?.status === 'failed' &&
            !isRetryDue &&
            !bypassBackoff
          ) {
            return;
          }

          await syncPendingWasteReminderSettings();

          if (trigger === 'foreground' || trigger === 'startup') {
            const currentState = await readWasteReminderLocalState();
            if (currentState?.scheduling?.status === 'scheduled') {
              const verificationResult = await verifyWasteReminderNotificationsFromLocalState({
                force: trigger === 'startup'
              });

              if (verificationResult.status === 'failed') {
                await refreshLocalWasteReminderNotifications();
              }
            } else {
              await refreshLocalWasteReminderNotifications();
            }
          } else {
            await refreshLocalWasteReminderNotifications();
          }

          const stateAfterAttempt = await readWasteReminderLocalState();
          if (stateAfterAttempt?.scheduling?.status !== stateBeforeAttempt?.scheduling?.status) {
            DeviceEventEmitter.emit(
              WASTE_REMINDER_SCHEDULING_STATUS_CHANGED_EVENT,
              stateAfterAttempt?.scheduling?.status
            );
          }
        });

      return maintenanceQueue.current;
    },
    [
      reconstructCurrentOwnerSettings,
      refreshLocalWasteReminderNotifications,
      syncPendingWasteReminderSettings
    ]
  );

  useEffect(() => {
    if (__DEV__) {
      void readWasteReminderLocalState().then((localState) => {
        // eslint-disable-next-line no-console
        console.info('[WasteReminder][app start local state]', JSON.stringify(localState, null, 2));
      });
    }
  }, []);

  useEffect(() => {
    enqueueWasteReminderMaintenance('startup');
  }, [enqueueWasteReminderMaintenance]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(PUSH_NOTIFICATION_TOKEN_CHANGED_EVENT, () =>
      enqueueWasteReminderMaintenance('token-change')
    );

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);

  useEffect(() => {
    if (hasRefreshedLocalNotificationsInitially.current) {
      return;
    }

    if (streetLoading || typesLoading || !streetData || !usedTypes) {
      return;
    }

    hasRefreshedLocalNotificationsInitially.current = true;
    enqueueWasteReminderMaintenance('data-ready');
  }, [enqueueWasteReminderMaintenance, streetData, streetLoading, typesLoading, usedTypes]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        enqueueWasteReminderMaintenance('foreground');
      }
    });

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
      (isEnabled: boolean) => {
        if (isEnabled) {
          enqueueWasteReminderMaintenance('permission-change');
        }
      }
    );

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(WASTE_REMINDER_MANUAL_RETRY_EVENT, () => {
      enqueueWasteReminderMaintenance('manual-retry');
    });

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);
};
