import { useEffect } from 'react';
import { DeviceEventEmitter } from 'react-native';

import { QUERY_TYPES } from '../queries';

export const HOME_REFRESH_EVENT = 'SVA_HOME_REFRESH';
export const VOLUNTEER_HOME_REFRESH_EVENT = 'SVA_VOLUNTEER_HOME_REFRESH';
export const VOLUNTEER_PERSONAL_REFRESH_EVENT = 'SVA_VOLUNTEER_PERSONAL_REFRESH';
export const VOLUNTEER_GROUP_REFRESH_EVENT = 'SVA_VOLUNTEER_GROUP_REFRESH';
export const VOLUNTEER_SETTINGS_REFRESH_EVENT = 'SVA_VOLUNTEER_SETTINGS_REFRESH';

export const useHomeRefresh = (onRefresh?: () => void) => {
  useEffect(() => {
    if (!onRefresh) return;

    const subscription = DeviceEventEmitter.addListener(HOME_REFRESH_EVENT, onRefresh);

    return () => subscription.remove();
  }, [onRefresh]);
};

const getRefreshKey = (query: string) => {
  switch (query) {
    case QUERY_TYPES.VOLUNTEER.GROUPS_MY:
    case QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY:
    case QUERY_TYPES.VOLUNTEER.CONVERSATIONS:
    case QUERY_TYPES.VOLUNTEER.PERSONAL:
      return VOLUNTEER_PERSONAL_REFRESH_EVENT;
    case QUERY_TYPES.VOLUNTEER.GROUP:
      return VOLUNTEER_GROUP_REFRESH_EVENT;
    case QUERY_TYPES.VOLUNTEER.USER_NOTIFICATION_SETTINGS:
      return VOLUNTEER_SETTINGS_REFRESH_EVENT;
    default:
      return VOLUNTEER_HOME_REFRESH_EVENT;
  }
};

export const useVolunteerRefresh = (onRefresh: () => void, query?: string) => {
  useEffect(() => {
    if (!query) return;

    const subscription = DeviceEventEmitter.addListener(getRefreshKey(query), onRefresh);

    return () => subscription.remove();
  }, [onRefresh, query]);
};
