import { useCallback, useState } from 'react';
import { useQuery } from 'react-query';

import { QUERY_TYPES } from '../queries';
import { getWaterTemperature } from '../queries/waterTemperature';
import { WaterTemperature } from '../types';

export const useWaterTemperature = (): {
  temperature: WaterTemperature;
  loading: boolean;
  refresh: () => void;
  refreshing: boolean;
} => {
  const [refreshing, setRefreshing] = useState(false);

  const { data: temperature, isLoading: loading, refetch } = useQuery(
    QUERY_TYPES.WATER_TEMPERATURE,
    getWaterTemperature
  );

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await refetch?.();
    setRefreshing(false);
  }, [refetch]);

  return {
    temperature: temperature?.temperature,
    loading,
    refresh,
    refreshing
  };
};
