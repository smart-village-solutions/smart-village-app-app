import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

export const HOME_REFRESH_EVENT = 'SVA_HOME_REFRESH';

export const useHomeRefresh = (onRefresh?: () => void) => {
  useEffect(() => {
    if (!onRefresh) return;

    const subscription = DeviceEventEmitter.addListener(HOME_REFRESH_EVENT, () => onRefresh());

    return () => subscription.remove();
  }, [onRefresh]);
};
