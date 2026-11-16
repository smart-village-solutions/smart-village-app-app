import { useFocusEffect } from 'expo-router/react-navigation';
import { useCallback } from 'react';
import { AppState } from 'react-native';

const REFRESH_INTERVAL_MS = 30_000;

/** Keep personal reports current only while their list is visible and online. */
export const useSueReportRefresh = (refetch: () => Promise<unknown>, enabled: boolean) => {
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;

      let isRefreshing = false;
      let previousAppState = AppState.currentState;
      const refresh = async () => {
        if (isRefreshing || AppState.currentState !== 'active') return;

        isRefreshing = true;
        try {
          await refetch();
        } catch (error) {
          console.error('Could not refresh personal SUE reports', error);
        } finally {
          isRefreshing = false;
        }
      };

      void refresh();
      const interval = setInterval(() => void refresh(), REFRESH_INTERVAL_MS);
      const subscription = AppState.addEventListener('change', (nextAppState) => {
        if (previousAppState !== 'active' && nextAppState === 'active') {
          void refresh();
        }
        previousAppState = nextAppState;
      });

      return () => {
        clearInterval(interval);
        subscription.remove();
      };
    }, [enabled, refetch])
  );
};
