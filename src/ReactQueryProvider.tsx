import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnMount: false } }
});

export const clearPersistentCaches = async () => {
  queryClient.clear();

  const keys = await AsyncStorage.getAllKeys();
  const persistentCacheKeys = keys.filter((key) => key.includes('apollo-cache-persist'));

  if (persistentCacheKeys.length) {
    await AsyncStorage.multiRemove(persistentCacheKeys);
  }
};

export const ReactQueryProvider = ({ children }: { children?: React.ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
