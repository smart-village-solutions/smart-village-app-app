import * as Updates from 'expo-updates';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import { device } from '../config/device';

export type OtaUpdatePhase = 'idle' | 'checking' | 'downloading' | 'ready' | 'error';

const isOtaUpdateSupported = () =>
  !__DEV__ && device.platform !== 'web' && Updates.isEnabled !== false;

export const useOtaUpdate = () => {
  const [phase, setPhase] = useState<OtaUpdatePhase>('idle');
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const appState = useRef(String(AppState.currentState || 'active'));
  const isMounted = useRef(true);
  const isCheckInFlight = useRef(false);
  const isUpdateReady = useRef(false);

  const setStateIfMounted = useCallback((callback: () => void) => {
    if (isMounted.current) {
      callback();
    }
  }, []);

  const showBanner = useCallback(() => {
    setStateIfMounted(() => {
      setPhase('ready');
      setIsBannerVisible(true);
    });
  }, [setStateIfMounted]);

  const hideBanner = useCallback(() => {
    setStateIfMounted(() => {
      setIsBannerVisible(false);
    });
  }, [setStateIfMounted]);

  const checkForOtaUpdate = useCallback(async () => {
    if (!isOtaUpdateSupported() || isCheckInFlight.current || isUpdateReady.current) {
      return;
    }

    isCheckInFlight.current = true;
    setStateIfMounted(() => {
      setPhase('checking');
    });

    try {
      const update = await Updates.checkForUpdateAsync();

      if (!update.isAvailable) {
        setStateIfMounted(() => {
          setPhase('idle');
        });
        return;
      }

      setStateIfMounted(() => {
        setPhase('downloading');
      });

      await Updates.fetchUpdateAsync();

      isUpdateReady.current = true;
      showBanner();
    } catch (error) {
      setStateIfMounted(() => {
        setPhase('error');
      });
      console.error('Error checking OTA update:', error);
    } finally {
      isCheckInFlight.current = false;
    }
  }, [setStateIfMounted, showBanner]);

  const dismissBanner = useCallback(() => {
    hideBanner();
  }, [hideBanner]);

  const reloadUpdate = useCallback(async () => {
    if (!isUpdateReady.current) {
      return;
    }

    setStateIfMounted(() => {
      setIsReloading(true);
      setIsBannerVisible(false);
    });

    try {
      await Updates.reloadAsync();
    } catch (error) {
      console.error('Error reloading OTA update:', error);
      setStateIfMounted(() => {
        setIsReloading(false);
        setIsBannerVisible(true);
      });
    }
  }, [setStateIfMounted]);

  const handleAppForeground = useCallback(() => {
    if (isUpdateReady.current) {
      showBanner();
      return;
    }

    void checkForOtaUpdate();
  }, [checkForOtaUpdate, showBanner]);

  useEffect(() => {
    isMounted.current = true;

    if (!isOtaUpdateSupported()) {
      return () => {
        isMounted.current = false;
      };
    }

    void checkForOtaUpdate();

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      const previousAppState = typeof appState.current === 'string' ? appState.current : 'active';

      if (/inactive|background/.test(previousAppState) && nextAppState === 'active') {
        handleAppForeground();
      }

      appState.current = String(nextAppState);
    });

    return () => {
      isMounted.current = false;
      subscription.remove();
    };
  }, [checkForOtaUpdate, handleAppForeground, showBanner]);

  return {
    dismissBanner,
    isBannerVisible,
    isReloading,
    phase,
    reloadUpdate
  };
};
