import { useNavigation } from '@react-navigation/core';
import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh, useRefreshTime } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

const currentDate = moment().format('YYYY-MM-DD');

export const EventWidget = ({ text }: WidgetProps) => {
  const navigation = useNavigation();
  const refreshTime = useRefreshTime('event-widget', consts.REFRESH_INTERVALS.ONCE_A_DAY);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const queryVariables = {
    dateRange: [currentDate, currentDate],
    order: 'listDate_ASC'
  };

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    variables: queryVariables,
    skip: !refreshTime
  });

  const onPress = useCallback(() => {
    navigation.navigate('Index', {
      title: text ?? texts.homeTitles.events,
      query: QUERY_TYPES.EVENT_RECORDS,
      queryVariables,
      rootRouteName: 'EventRecords',
      filterByDailyEvents: true
    });
  }, [navigation, text, queryVariables]);

  useHomeRefresh(refetch);

  const eventCount = data?.eventRecords?.length;

  return (
    <DefaultWidget
      count={eventCount}
      Icon={Icon.Calendar}
      onPress={onPress}
      text={text ?? texts.widgets.events}
    />
  );
};
