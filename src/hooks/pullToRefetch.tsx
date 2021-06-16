import React, { useCallback, useEffect, useState } from 'react';
import { RefreshControl } from 'react-native';
import { colors } from '../config';

export const usePullToRefetch = (loading?: boolean, refetch?: () => void) => {
  const [refreshing, setRefreshing] = useState(false);

  const refresh = useCallback(() => {
    setRefreshing(true);
    refetch?.();
  }, [refetch]);

  useEffect(() => {
    !loading && setRefreshing(false);
  }, [loading]);

  return (
    <RefreshControl
      refreshing={refreshing}
      onRefresh={refresh}
      colors={[colors.accent]}
      tintColor={colors.accent}
    />
  );
};
