import { useCallback, useEffect, useState } from 'react';

import { consts } from '../config';
import { refreshTimeFor } from '../helpers';

export const useRefreshTime = (
  refreshTimeKey: string,
  refreshInterval = consts.REFRESH_INTERVALS.ONCE_A_DAY
) => {
  const [refreshTime, setRefreshTime] = useState<number>();

  const getRefreshTime = useCallback(async () => {
    const time = await refreshTimeFor(refreshTimeKey, refreshInterval);

    setRefreshTime(time);
  }, [refreshTimeKey, setRefreshTime]);

  useEffect(() => {
    getRefreshTime();
  }, [getRefreshTime]);

  return refreshTime;
};

// counts up a number on a set interval
export const useInterval = (ms?: number) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!ms) return;

    const id = setInterval(() => {
      setCount((value) => value + 1);
    }, ms);

    return () => clearInterval(id);
  }, [ms, setCount]);

  return count;
};
