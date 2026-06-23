import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

import { CACHE_SCOPES, millisecondsUntilCacheExpires } from './helpers/cacheHelper';

const queryDefaultOptions = (globalSettings?: Record<string, unknown>) => ({
  queries: {
    cacheTime: millisecondsUntilCacheExpires(globalSettings, CACHE_SCOPES.GENERAL),
    retry: 2,
    refetchOnMount: false
  }
});

const createQueryClient = (globalSettings?: Record<string, unknown>) =>
  new QueryClient({
    defaultOptions: queryDefaultOptions(globalSettings)
  });

export const ReactQueryProvider = ({
  children,
  globalSettings
}: {
  children?: React.ReactNode;
  globalSettings?: Record<string, unknown>;
}) => {
  const [queryClient] = useState(() => createQueryClient(globalSettings));

  useEffect(() => {
    queryClient.setDefaultOptions(queryDefaultOptions(globalSettings));
  }, [globalSettings, queryClient]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const expireCache = () => {
      queryClient.removeQueries({ predicate: (query) => !query.isActive() });
      queryClient.invalidateQueries();
    };

    const scheduleEndOfDayCacheReset = () => {
      const delay = millisecondsUntilCacheExpires(globalSettings, CACHE_SCOPES.GENERAL);

      if (delay <= 0) {
        expireCache();

        return;
      }

      timeoutId = setTimeout(() => {
        expireCache();
        scheduleEndOfDayCacheReset();
      }, delay);
    };

    scheduleEndOfDayCacheReset();

    return () => clearTimeout(timeoutId);
  }, [globalSettings, queryClient]);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
