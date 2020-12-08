import moment from 'moment';
import _isEmpty from 'lodash/isEmpty';

import { consts } from '../config/consts';
import { addToStore, readFromStore } from './storageHelper';

/**
 * Calculate the refresh time for a given refresh interval type.
 * This is necessary to make comparisons while getting the fetch policy
 * for queries.
 * If there is already a refresh time stored, than return this, otherwise the current time.
 * Store a new refresh time in AsyncStorage to relate to in future renderings.
 * @async
 * @param {string} refreshTimeKey the unique key of the screen to set the refresh time for
 * @param {string} refreshInterval the refresh interval to apply
 *
 * @return {Promise<number>} refresh time in seconds from 01.01.1970 00:00:00 UTC
 */
export const refreshTimeFor = async (refreshTimeKey, refreshInterval) => {
  const refreshIntervals = await readFromStore('refresh-intervals');
  const now = moment().unix(); // now in seconds from 01.01.1970 00:00:00 UTC
  const refreshTime =
    _isEmpty(refreshIntervals) || !refreshIntervals[refreshTimeKey]
      ? now
      : refreshIntervals[refreshTimeKey];

  switch (refreshInterval) {
  case consts.REFRESH_INTERVALS.ONCE_A_DAY: {
    const endOfDay = moment().endOf('day').unix();

    if (endOfDay > refreshTime) {
      // store or update refresh time in AsyncStorage
      addToStore('refresh-intervals', { ...refreshIntervals, [refreshTimeKey]: endOfDay });
    }

    break;
  }
  default:
    break;
  }

  return refreshTime;
};
