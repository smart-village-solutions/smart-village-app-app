import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';

/**
 * Shared react-query client reused across the app with consistent defaults.
 */
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 2, refetchOnMount: false } }
});

/**
 * Supplies the shared react-query client to all descendants.
 */
export const ReactQueryProvider = ({ children }: { children?: React.ReactNode }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};
