import React, { useCallback, useState } from 'react';
import { RefreshControl } from 'react-native';

import { colors } from '../config';

export const usePullToRefetch = (refetch?: () => Promise<unknown>) => {
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
      colors={[colors.accent]}
      tintColor={colors.accent}
    />
  );
};
