import { useNavigation } from '@react-navigation/core';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';
import { testIDs } from '../../config/maestro';

export const ConstructionSiteNewsWidget = ({ text, additionalProps }: WidgetProps) => {
  const navigation = useNavigation();
  const refreshTime = useRefreshTime('news-widget', consts.REFRESH_INTERVALS.ONCE_PER_HOUR);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const queryVariables = { dataProviderId: additionalProps?.dataProviderId };

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.NEWS_ITEMS), {
    fetchPolicy,
    variables: queryVariables,
    skip: !refreshTime
  });

  const onPress = useCallback(() => {
    navigation.navigate('Index', {
      title: text ?? texts.widgets.constructionSites,
      titleDetail: texts.screenTitles.constructionSite,
      query: QUERY_TYPES.NEWS_ITEMS,
      queryVariables,
      bookmarkable: false,
      showFilter: false
    });
  }, [navigation, text, queryVariables]);

  useHomeRefresh(refetch);

  const count = data?.newsItems?.length;

  return (
    <DefaultWidget
      count={count}
      Icon={Icon.ConstructionSite}
      onPress={onPress}
      testID={testIDs.widgets.constructionSiteNews}
      text={text ?? texts.widgets.constructionSites}
    />
  );
};
