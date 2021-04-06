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

// max interval length at which the useInterval hook checks against the input ms
const MAX_INTERVALL = 100;

// updates a timestamp on a set interval
export const useInterval = (ms?: number) => {
  const [timestamp, setTimestamp] = useState(new Date().valueOf());

  useEffect(() => {
    if (!ms) return;

    const id = setInterval(() => {
      const currentTime = new Date().valueOf();

      if (currentTime - timestamp >= ms) {
        setTimestamp(new Date().valueOf());
      }
    }, Math.min(ms, MAX_INTERVALL));

    return () => clearInterval(id);
  }, [ms, setTimestamp, timestamp]);

  return timestamp;
};
