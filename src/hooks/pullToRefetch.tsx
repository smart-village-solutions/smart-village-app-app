import React, { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { useTheme } from './useTheme';

export const usePullToRefetch = (refetch?: () => Promise<unknown>) => {
  const { colors } = useTheme();
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refetch?.();
    setRefreshing(false);
  }, [refetch]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      colors={[colors.refreshControl]}
      tintColor={colors.refreshControl}
    />
  );
};
