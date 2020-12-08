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
