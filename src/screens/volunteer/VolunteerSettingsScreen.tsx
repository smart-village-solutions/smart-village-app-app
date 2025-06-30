import React, { useCallback } from 'react';
import { DeviceEventEmitter, ScrollView } from 'react-native';

import { SafeAreaViewFlex, VolunteerUserNotificationSettings } from '../../components';
import { usePullToRefetch, VOLUNTEER_SETTINGS_REFRESH_EVENT } from '../../hooks';

export const VolunteerSettingsScreen = () => {
  const refreshGroup = useCallback(async () => {
    // this will trigger the onRefresh functions provided to the `useVolunteerRefresh` hook
    // in other components.
    DeviceEventEmitter.emit(VOLUNTEER_SETTINGS_REFRESH_EVENT);
  }, []);

  const RefreshControl = usePullToRefetch(refreshGroup);

  return (
    <SafeAreaViewFlex>
      <ScrollView refreshControl={RefreshControl}>
        <VolunteerUserNotificationSettings />
      </ScrollView>
    </SafeAreaViewFlex>
  );
};
