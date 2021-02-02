import moment from 'moment';
import React, { useCallback, useContext } from 'react';
import { useQuery } from 'react-apollo';

import { colors, consts, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useRefreshTime } from '../../hooks';
import { useHomeRefresh } from '../../hooks/HomeRefresh';
import { calendar } from '../../icons';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { WidgetProps } from '../../types';
import { DefaultWidget } from './DefaultWidget';

export const EventWidget = ({ navigation, text }: WidgetProps) => {
  const refreshTime = useRefreshTime('event-widget', consts.REFRESH_INTERVALS.ONCE_A_DAY);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const currentDate = moment().format('YYYY-MM-DD');
  const queryVariables = {
    dateRange: [currentDate, currentDate]
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
      rootRouteName: 'EventRecords'
    });
  }, [navigation]);

  useHomeRefresh(refetch);

  const eventCount = data?.eventRecords?.length;

  return (
    <DefaultWidget
      icon={calendar(colors.primary)}
      count={eventCount}
      onPress={onPress}
      text={text ?? texts.widgets.events}
    />
  );
};
