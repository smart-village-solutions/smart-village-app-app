import { useContext, useEffect } from 'react';
import { AppState } from 'react-native';
import { useQueryClient } from 'react-query';

import { NetworkContext } from './NetworkProvider';
import { subscribeSueOutbox } from './helpers/sueReportStorage';
import { syncSueOutbox } from './helpers/sueReportSync';
import { QUERY_TYPES } from './queries/types';

export const SueReportRuntime = () => {
  const { isConnected } = useContext(NetworkContext);
  const queryClient = useQueryClient();

  useEffect(
    () =>
      subscribeSueOutbox(() => {
        queryClient.invalidateQueries(QUERY_TYPES.SUE.MY_REQUESTS);
        queryClient.invalidateQueries('sueOutboxReport');
      }),
    [queryClient]
  );

  useEffect(() => {
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
  }, [isConnected]);

  return null;
};
