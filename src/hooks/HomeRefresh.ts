import { DeviceEventEmitter } from 'expo-modules-core';
import { useEffect } from 'react';

export const HOME_REFRESH_EVENT = 'SVA_HOME_REFRESH';

export const useHomeRefresh = (onRefresh?: () => void) => {
  useEffect(() => {
    if (!onRefresh) return;

    const subscription = DeviceEventEmitter.addListener(HOME_REFRESH_EVENT, () => onRefresh());

    return () => subscription.remove();
  }, [onRefresh]);
};
