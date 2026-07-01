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
    }
  }, [isConnected, isMainserverUp]);

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
    (options: { shouldRefreshLocalNotifications: boolean }) => {
      maintenanceQueue.current = maintenanceQueue.current
        .catch(() => undefined)
        .then(async () => {
          const hasInAppPermission = await getInAppPermission();

          if (!hasInAppPermission) {
            return;
          }

          const clearedStateForChangedOwner = await clearWasteReminderLocalStateForChangedOwner();

          if (clearedStateForChangedOwner) {
            return;
          }

          await syncPendingWasteReminderSettings();

          if (options.shouldRefreshLocalNotifications) {
            await refreshLocalWasteReminderNotifications();
          }
        });

      return maintenanceQueue.current;
    },
    [refreshLocalWasteReminderNotifications, syncPendingWasteReminderSettings]
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
          enqueueWasteReminderMaintenance({ shouldRefreshLocalNotifications: true });
        }
      }
    );

    return () => subscription.remove();
  }, [enqueueWasteReminderMaintenance]);
};
