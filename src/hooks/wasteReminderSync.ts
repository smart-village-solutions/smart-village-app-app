import { useCallback, useContext, useEffect, useRef } from 'react';
import { AppState, DeviceEventEmitter } from 'react-native';

import { NetworkContext } from '../NetworkProvider';
import {
  clearWasteReminderLocalStateForChangedOwner,
  getInAppPermission,
  markWasteReminderServerSyncSynced,
  PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
  readWasteReminderLocalState,
  rescheduleWasteReminderNotificationsFromLocalState,
  storeWasteReminderSettingsWithoutScheduling,
  syncWasteReminderSettingsWithServer
} from '../pushNotifications';
import { getLocationData } from '../screens';
import { SettingsContext } from '../SettingsProvider';

import { useStreetString, useWasteStreet, useWasteTypes, useWasteUsedTypes } from './waste';

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

  const buildDisruptionPayload = useCallback(() => {
    const settings = globalSettings.waste?.disruptionNotificationSettings as
      | { disruption_all_locations?: boolean; disruption_location?: boolean }
      | undefined;
    if (!settings) return undefined;

    const locationData = streetData ? getLocationData(streetData) : undefined;
    return {
      activeTypes: {},
      disruptionRegistrations: {
        disruption_all_locations: { active: !!settings.disruption_all_locations },
        disruption_location: { active: !!locationData && !!settings.disruption_location }
      },
      locationData,
      notificationSettings: {},
      reminderTime: new Date('2000-01-01T00:00:00.000+01:00'),
      usedTypeKeys: []
    };
  }, [globalSettings.waste?.disruptionNotificationSettings, streetData]);

  const syncPendingWasteReminderSettings = useCallback(
    async (forceIntentReconcile = false) => {
      if (!isConnected || !isMainserverUp) {
        return;
      }

      // A missing street while the query is still loading does not mean that the
      // user removed their pickup location. Reconcile only once that distinction
      // is known, otherwise an existing location subscription could be deleted.
      if (streetLoading) {
        return;
      }

      const localState = await readWasteReminderLocalState();

      let payload = localState?.serverSyncPayload;
      if (localState?.serverSyncStatus !== 'pending' || !payload) {
        const desiredPayload = buildDisruptionPayload();
        if (!desiredPayload) return;
        const currentDisruptions = payload?.disruptionRegistrations;
        const intentChanged = (['disruption_all_locations', 'disruption_location'] as const).some(
          (key) =>
            !!currentDisruptions?.[key]?.active !==
            !!desiredPayload.disruptionRegistrations[key]?.active
        );
        if (!forceIntentReconcile && !intentChanged) return;

        payload = {
          ...desiredPayload,
          disruptionRegistrations: {
            disruption_all_locations: {
              ...desiredPayload.disruptionRegistrations.disruption_all_locations,
              storeId: currentDisruptions?.disruption_all_locations?.storeId
            },
            disruption_location: {
              ...desiredPayload.disruptionRegistrations.disruption_location,
              storeId: currentDisruptions?.disruption_location?.storeId
            }
          }
        };
        await storeWasteReminderSettingsWithoutScheduling(payload);
      }

      const { serverSyncPayload, success } = await syncWasteReminderSettingsWithServer(
        payload,
        localState?.localCoverageUntil ? new Date(localState.localCoverageUntil) : undefined
      );

      if (success) {
        await markWasteReminderServerSyncSynced(serverSyncPayload);
      }
    },
    [buildDisruptionPayload, isConnected, isMainserverUp, streetLoading]
  );

  const refreshLocalWasteReminderNotifications = useCallback(async () => {
    if (streetLoading || typesLoading || !streetData || !usedTypes) {
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

  const enqueueWasteReminderMaintenance = useCallback(
    (options: { forceIntentReconcile?: boolean; shouldRefreshLocalNotifications: boolean }) => {
      maintenanceQueue.current = maintenanceQueue.current
        .catch(() => undefined)
        .then(async () => {
          const hasInAppPermission = await getInAppPermission();

          if (!hasInAppPermission) {
            return;
          }

          const clearedStateForChangedOwner = await clearWasteReminderLocalStateForChangedOwner();

          if (clearedStateForChangedOwner) {
            const payload = buildDisruptionPayload();
            if (payload) {
              await storeWasteReminderSettingsWithoutScheduling(payload);
              const result = await syncWasteReminderSettingsWithServer(payload);
              if (result.success) {
                await markWasteReminderServerSyncSynced(result.serverSyncPayload);
              }
            }
            return;
          }

          await syncPendingWasteReminderSettings(!!options.forceIntentReconcile);

          if (options.shouldRefreshLocalNotifications) {
            await refreshLocalWasteReminderNotifications();
          }
        });

      return maintenanceQueue.current;
    },
    [
      buildDisruptionPayload,
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
    enqueueWasteReminderMaintenance({ shouldRefreshLocalNotifications: false });
  }, [enqueueWasteReminderMaintenance]);

  useEffect(() => {
    if (hasRefreshedLocalNotificationsInitially.current) {
      return;
    }

    if (streetLoading || typesLoading || !streetData || !usedTypes) {
      return;
    }

    hasRefreshedLocalNotificationsInitially.current = true;
    enqueueWasteReminderMaintenance({ shouldRefreshLocalNotifications: true });
  }, [enqueueWasteReminderMaintenance, streetData, streetLoading, typesLoading, usedTypes]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        enqueueWasteReminderMaintenance({ shouldRefreshLocalNotifications: true });
      }
    });

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(
      PUSH_NOTIFICATION_PERMISSION_CHANGED_EVENT,
      (isEnabled: boolean) => {
        if (isEnabled) {
          enqueueWasteReminderMaintenance({
            forceIntentReconcile: true,
            shouldRefreshLocalNotifications: true
          });
        }
      }
    );

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);
};
