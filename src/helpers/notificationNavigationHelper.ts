import { texts } from '../config';
import { navigationRef, runWhenNavigationReady } from '../navigation/navigationRef';
import { QUERY_TYPES, getQueryType } from '../queries/types';
import { ScreenName } from '../types';

import { queryVariablesFromQuery, rootRouteName, routeNameFromQuery } from './queryHelper';

type NotificationNavigationTarget = {
  name: ScreenName;
  params: Record<string, unknown>;
};

export const getNotificationNavigationTarget = (
  data: Record<string, unknown> = {}
): NotificationNavigationTarget | undefined => {
  const { id, query_type: queryType, title } = data;
  const query = queryType ? getQueryType(queryType) : undefined;
  const name = routeNameFromQuery(query);

  if (query === QUERY_TYPES.WASTE_ADDRESSES && name === ScreenName.WasteCollection) {
    return {
      name,
      params: {
        title: title || texts.screenTitles.wasteCollection
      }
    };
  }

  if (id && name && query) {
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
