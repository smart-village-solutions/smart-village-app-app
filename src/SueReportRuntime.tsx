import { useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from 'react-query';

import { NetworkContext } from './NetworkProvider';
import { SettingsContext } from './SettingsProvider';
import { hasSueApiConfiguration } from './helpers/sueHelper';
import { subscribeSueOutbox } from './helpers/sueReportStorage';
import { syncSueOutbox } from './helpers/sueReportSync';
import { QUERY_TYPES } from './queries/types';

export const SueReportRuntime = () => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const settings = globalSettings.settings as {
    sue?: Parameters<typeof hasSueApiConfiguration>[0];
  };
  const enabled = hasSueApiConfiguration(settings?.sue);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;
    return subscribeSueOutbox(() => {
      queryClient.invalidateQueries(QUERY_TYPES.SUE.MY_REQUESTS);
      queryClient.invalidateQueries('sueOutboxReport');
    });
  }, [enabled, queryClient]);

  useEffect(() => {
    if (!enabled) return;
    const sync = (force = false) => {
      syncSueOutbox(force).catch(() => console.error('Could not synchronize SUE outbox'));
    };
    sync(true);
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync(true);
    });
    const timer = setInterval(() => sync(), 30_000);
    return () => {
      subscription.remove();
      clearInterval(timer);
    };
  }, [enabled, isConnected]);

  return null;
};
