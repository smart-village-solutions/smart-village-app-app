import { useNavigation } from '@react-navigation/core';
import moment from 'moment';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';

import { consts, Icon, texts } from '../../config';
import { graphqlFetchPolicy } from '../../helpers';
import { useHomeRefresh, useRefreshTime, useVolunteerData } from '../../hooks';
import { NetworkContext } from '../../NetworkProvider';
import { getQuery, QUERY_TYPES } from '../../queries';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

const { REFRESH_INTERVALS, ROOT_ROUTE_NAMES } = consts;

const today = moment().format('YYYY-MM-DD');

export const EventWidget = ({ text, additionalProps }: WidgetProps) => {
  const navigation = useNavigation();
  const refreshTime = useRefreshTime('event-widget', REFRESH_INTERVALS.ONCE_A_DAY);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { deprecated = {}, hdvt = {} } = globalSettings;
  const { events: showVolunteerEvents = false } = hdvt as { events?: boolean };
  const [queryVariables] = useState<{ dateRange?: string[]; limit?: number; order: string }>({
    dateRange: [today, today],
    order: 'listDate_ASC'
  });
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  if (additionalProps?.noFilterByDailyEvents) {
    delete queryVariables.dateRange;
  }

  const { data, loading, refetch } = useQuery(
    getQuery(
      deprecated?.events?.listingWithoutDateFragment
        ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
        : QUERY_TYPES.EVENT_RECORDS
    ),
    {
      fetchPolicy,
      variables: queryVariables,
      skip: !refreshTime
    }
  );

  const { data: dataVolunteerEvents, refetch: refetchVolunteerEvents } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryVariables,
    queryOptions: { enabled: showVolunteerEvents && !loading },
    isCalendar: true,
    isSectioned: true
  });

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Index, {
      title: text ?? texts.homeTitles.events,
      query: QUERY_TYPES.EVENT_RECORDS,
      queryVariables: {
        ...queryVariables,
        limit: additionalProps?.limit || 15
      },
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
      filterByDailyEvents: additionalProps?.noFilterByDailyEvents ? false : true
    });
  }, [navigation, text, queryVariables]);

  useHomeRefresh(() => {
    refetch();
    showVolunteerEvents && refetchVolunteerEvents();
  });

  const count = (data?.eventRecords?.length || 0) + (dataVolunteerEvents?.length || 0);

  return (
    <DefaultWidget
      count={additionalProps?.noCount || loading ? undefined : count}
      Icon={Icon.Calendar}
      image={additionalProps?.image}
      onPress={onPress}
      text={text ?? texts.widgets.events}
    />
  );
};
