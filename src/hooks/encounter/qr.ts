import { useCallback, useEffect, useState } from 'react';

import { createQrCodeAsync } from '../../encounterApi';

// TODO: implement api call
export const useQRValue = (): {
  error: boolean;
  loading: boolean;
  qrValue?: string;
  refresh: () => Promise<void>;
  refreshing: boolean;
} => {
  const [qrValue, setQrValue] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const getQRValue = useCallback(async () => {
    setError(false);
    setRefreshing(true);

    const res = await createQrCodeAsync();

    res?.length ? setQrValue(res) : setError(true);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    getQRValue();
  }, [getQRValue]);

  return { loading, qrValue, error, refresh: getQRValue, refreshing };
};
