import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect } from 'react';
import { QueryClient, QueryClientProvider, useQueryClient } from 'react-query';

import { CACHE_SCOPES, millisecondsUntilCacheExpires } from './helpers/cacheHelper';

const queryDefaultOptions = (globalSettings?: Record<string, unknown>) => ({
  queries: {
    cacheTime: millisecondsUntilCacheExpires(globalSettings, CACHE_SCOPES.GENERAL),
    retry: 2,
    refetchOnMount: false
  }
});

const queryClient = new QueryClient({
  defaultOptions: queryDefaultOptions()
});

export const clearPersistentCaches = async () => {
  queryClient.clear();

  const keys = await AsyncStorage.getAllKeys();
  const persistentCacheKeys = keys.filter((key) => key.includes('apollo-cache-persist'));

  if (persistentCacheKeys.length) {
    await AsyncStorage.multiRemove(persistentCacheKeys);
  }
};

export const ReactQueryCacheSettings = ({
  globalSettings
}: {
  globalSettings?: Record<string, unknown>;
}) => {
  const queryClient = useQueryClient();

  const applyQueryDefaults = useCallback(() => {
    queryClient.setDefaultOptions(queryDefaultOptions(globalSettings));
  }, [globalSettings, queryClient]);

  useEffect(() => {
    applyQueryDefaults();
  }, [applyQueryDefaults]);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const expireCache = () => {
      queryClient.removeQueries({ predicate: (query) => !query.isActive() });
      queryClient.invalidateQueries();
    };

    const scheduleEndOfDayCacheReset = () => {
      applyQueryDefaults();

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
  }, [applyQueryDefaults, globalSettings, queryClient]);

  return null;
};

export const ReactQueryProvider = ({ children }: { children?: React.ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
