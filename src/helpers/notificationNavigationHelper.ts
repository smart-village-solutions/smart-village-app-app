import { texts } from '../config';
import {
  hasRootNavigationRoute,
  navigationRef,
  runWhenNavigationReady
} from '../navigation/navigationRef';
import { QUERY_TYPES, getQueryType } from '../queries/types';
import { ScreenName } from '../types';

import { queryVariablesFromQuery, rootRouteName, routeNameFromQuery } from './queryHelper';

type NotificationNavigationTarget = {
  name: ScreenName;
  params: Record<string, unknown>;
};

const hasValidNotificationId = (id: unknown): id is string | number =>
  (typeof id === 'string' || typeof id === 'number') && String(id).trim().length > 0;

const VOLUNTEER_DETAIL_QUERIES: string[] = [
  QUERY_TYPES.VOLUNTEER.CALENDAR,
  QUERY_TYPES.VOLUNTEER.CONVERSATION,
  QUERY_TYPES.VOLUNTEER.GROUP,
  QUERY_TYPES.VOLUNTEER.USER
];

const VOLUNTEER_DESTINATION_ROUTES: Record<string, ScreenName> = {
  [QUERY_TYPES.VOLUNTEER.CALENDAR_ALL]: ScreenName.VolunteerIndex,
  [QUERY_TYPES.VOLUNTEER.CALENDAR_ALL_MY]: ScreenName.VolunteerIndex,
  [QUERY_TYPES.VOLUNTEER.CONVERSATIONS]: ScreenName.VolunteerIndex,
  [QUERY_TYPES.VOLUNTEER.GROUPS]: ScreenName.VolunteerIndex,
  [QUERY_TYPES.VOLUNTEER.GROUPS_MY]: ScreenName.VolunteerIndex,
  [QUERY_TYPES.VOLUNTEER.HOME]: ScreenName.VolunteerHome,
  [QUERY_TYPES.VOLUNTEER.ME]: ScreenName.VolunteerMe,
  [QUERY_TYPES.VOLUNTEER.PROFILE]: ScreenName.VolunteerMe,
  [QUERY_TYPES.VOLUNTEER.PERSONAL]: ScreenName.VolunteerPersonal,
  [QUERY_TYPES.VOLUNTEER.STREAM]: ScreenName.VolunteerStream,
  [QUERY_TYPES.VOLUNTEER.USER_NOTIFICATION_SETTINGS]: ScreenName.VolunteerSettings
};

const getVolunteerNavigationTarget = ({
  data,
  query,
  title
}: {
  data: Record<string, unknown>;
  query: string;
  title: unknown;
}): NotificationNavigationTarget | undefined => {
  const params = {
    query,
    queryVariables: {},
    rootRouteName: rootRouteName(query),
    title
  };

  if (VOLUNTEER_DETAIL_QUERIES.includes(query)) {
    if (!hasValidNotificationId(data.id)) return;

    return {
      name: ScreenName.VolunteerDetail,
      params: {
        ...params,
        details: null,
        queryVariables: queryVariablesFromQuery(query, data),
        shareContent: null
      }
    };
  }

  const name = VOLUNTEER_DESTINATION_ROUTES[query];

  if (!name) return;

  return { name, params };
};

const getStandardNavigationTarget = ({
  data,
  query,
  title
}: {
  data: Record<string, unknown>;
  query: string;
  title: unknown;
}): NotificationNavigationTarget | undefined => {
  const name = routeNameFromQuery(query);

  if (query === QUERY_TYPES.WASTE_ADDRESSES && name === ScreenName.WasteCollection) {
    return {
      name,
      params: {
        title: title || texts.screenTitles.wasteCollection
      }
    };
  }

  if (!hasValidNotificationId(data.id) || !name) return;

  return {
    name,
    params: {
      details: null,
      query,
      queryVariables: queryVariablesFromQuery(query, data),
      rootRouteName: rootRouteName(query),
      shareContent: null,
      title: title || texts.detailTitles[query]
    }
  };
};

export const getNotificationNavigationTarget = (
  data: Record<string, unknown> = {}
): NotificationNavigationTarget | undefined => {
  const { title } = data;
  const queryType = data.query_type ?? data.queryType;
  const query = typeof queryType === 'string' ? getQueryType(queryType) : undefined;

  if (!query) return;

  if ((Object.values(QUERY_TYPES.VOLUNTEER) as string[]).includes(query)) {
    return getVolunteerNavigationTarget({ data, query, title });
  }

  return getStandardNavigationTarget({ data, query, title });
};

export const navigateToNotificationTarget = ({
  navigationTarget,
  navigationType
}: {
  navigationTarget: NotificationNavigationTarget;
  navigationType?: string;
}) => {
  const rootRouteName = navigationType === 'drawer' ? 'AppStack' : 'Stack0';

  runWhenNavigationReady(
    () => {
      const params = {
        params: navigationTarget.params,
        screen: navigationTarget.name
      };

      if (__DEV__) {
        // eslint-disable-next-line no-console
        console.info(
          '[PushNotification][root navigation]',
          JSON.stringify({ rootRouteName, params }, null, 2)
        );
      }

      navigationRef.navigate(rootRouteName, params);
    },
    () => hasRootNavigationRoute(rootRouteName),
    'notification'
  );
};

export const navigateToWasteNotificationTarget = navigateToNotificationTarget;
