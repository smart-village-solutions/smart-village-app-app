import { DeviceEventEmitter } from 'expo-modules-core';
import { useEffect } from 'react';

export const HOME_REFRESH_EVENT = 'SVA_HOME_REFRESH';
export const VOLUNTEER_HOME_REFRESH_EVENT = 'SVA_VOLUNTEER_HOME_REFRESH';

export const useHomeRefresh = (onRefresh?: () => void) => {
  useEffect(() => {
    if (!onRefresh) return;

    const subscription = DeviceEventEmitter.addListener(HOME_REFRESH_EVENT, () => onRefresh());

    return () => subscription.remove();
  }, [onRefresh]);
};

export const useVolunteerHomeRefresh = (onRefresh?: () => void) => {
  useEffect(() => {
    if (!onRefresh) return;

    const subscription = DeviceEventEmitter.addListener(VOLUNTEER_HOME_REFRESH_EVENT, () =>
      onRefresh()
    );

    return () => subscription.remove();
  }, [onRefresh]);
};
