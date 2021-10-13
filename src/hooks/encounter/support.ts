import { useCallback, useEffect, useState } from 'react';

import { createSupportIdAsync } from '../../encounterApi';

export const useEncounterSupportId = (): {
  error: boolean;
  loading: boolean;
  supportId?: string;
  refresh: () => Promise<void>;
  refreshing: boolean;
} => {
  const [supportId, setSupportId] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getSupportId = useCallback(async () => {
    setError(false);
    setRefreshing(true);

    const res = await createSupportIdAsync();

    res?.length ? setSupportId(res) : setError(true);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getSupportId();
  }, [getSupportId]);

  return { loading, supportId, error, refresh: getSupportId, refreshing };
};
