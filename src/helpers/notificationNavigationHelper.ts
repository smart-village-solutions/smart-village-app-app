import { texts } from '../config';
import { navigationRef, runWhenNavigationReady } from '../navigation/navigationRef';
import { QUERY_TYPES, getQueryType } from '../queries/types';
import { ScreenName } from '../types';

import { queryVariablesFromQuery, rootRouteName, routeNameFromQuery } from './queryHelper';

type NotificationNavigationTarget = {
  name: ScreenName;
  params: Record<string, unknown>;
};

const hasValidNotificationId = (id: unknown): id is string | number =>
  (typeof id === 'string' || typeof id === 'number') && String(id).trim().length > 0;

export const getNotificationNavigationTarget = (
  data: Record<string, unknown> = {}
): NotificationNavigationTarget | undefined => {
  const { id, title } = data;
  const queryType = data.query_type ?? data.queryType;
  const query = typeof queryType === 'string' ? getQueryType(queryType) : undefined;
  const name = routeNameFromQuery(query);

  if (query === QUERY_TYPES.WASTE_ADDRESSES && name === ScreenName.WasteCollection) {
    return {
      name,
      params: {
        title: title || texts.screenTitles.wasteCollection
      }
    };
  }

  if (hasValidNotificationId(id) && name && query) {
    const queryVariables = queryVariablesFromQuery(query, data);

    return {
      name,
      params: {
        details: null,
        query,
        queryVariables,
        rootRouteName: rootRouteName(query),
        shareContent: null,
        title: title || texts.detailTitles[query]
      }
    };
  }
};

export const navigateToNotificationTarget = ({
  navigationTarget,
  navigationType
}: {
  navigationTarget: NotificationNavigationTarget;
  navigationType?: string;
}) => {
  runWhenNavigationReady(() => {
    const rootRouteName = navigationType === 'drawer' ? 'AppStack' : 'Stack0';
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
  });
};

export const navigateToWasteNotificationTarget = navigateToNotificationTarget;
