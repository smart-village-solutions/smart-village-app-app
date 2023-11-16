import { DeviceEventEmitter } from 'expo-modules-core';
import { useEffect } from 'react';

export const DETAIL_REFRESH_EVENT = 'SVA_DETAIL_REFRESH';

export const useDetailRefresh = (onRefresh?: () => void) => {
  useEffect(() => {
    if (!onRefresh) return;

    const subscription = DeviceEventEmitter.addListener(DETAIL_REFRESH_EVENT, onRefresh);

    return () => subscription.remove();
  }, [onRefresh]);
};
