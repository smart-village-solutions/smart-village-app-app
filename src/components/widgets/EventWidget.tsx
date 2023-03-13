import { useNavigation } from '@react-navigation/core';
import moment from 'moment';
import React, { useCallback, useContext } from 'react';
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

const currentDate = moment().format('YYYY-MM-DD');

export const EventWidget = ({ text, additionalProps }: WidgetProps) => {
  const navigation = useNavigation();
  const refreshTime = useRefreshTime('event-widget', REFRESH_INTERVALS.ONCE_A_DAY);
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { hdvt = {} } = globalSettings;
  const { events: showVolunteerEvents = false } = hdvt as { events?: boolean };

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp, refreshTime });

  const queryVariables: { dateRange?: string[]; order: string } = {
    dateRange: [currentDate, currentDate],
    order: 'listDate_ASC'
  };

  if (additionalProps?.noFilterByDailyEvents) {
    delete queryVariables.dateRange;
  }

  const { data, refetch } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    variables: queryVariables,
    skip: !refreshTime
  });

  const { data: dataVolunteerEvents, refetch: refetchVolunteerEvents } = useVolunteerData({
    query: QUERY_TYPES.VOLUNTEER.CALENDAR_ALL,
    queryOptions: { enabled: showVolunteerEvents },
    isCalendar: showVolunteerEvents,
    isSectioned: false
  });

  const onPress = useCallback(() => {
    navigation.navigate(ScreenName.Index, {
      title: text ?? texts.homeTitles.events,
      query: QUERY_TYPES.EVENT_RECORDS,
      queryVariables,
      rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
      filterByDailyEvents: additionalProps?.noFilterByDailyEvents ? false : true
    });
  }, [navigation, text, queryVariables]);

  useHomeRefresh(() => {
    refetch();
    showVolunteerEvents && refetchVolunteerEvents();
  });

  // TODO: filter dataVolunteerEvents by date range already in the request if this will be possible
  const todaysDataVolunteerEvents = dataVolunteerEvents?.filter(
    ({ listDate }: { listDate: string }) => listDate === currentDate
  );

  let eventCount = data?.eventRecords?.length || 0;

  if (showVolunteerEvents && todaysDataVolunteerEvents?.length) {
    eventCount += todaysDataVolunteerEvents.length;
  }

  return (
    <DefaultWidget
      count={additionalProps?.noCount ? null : eventCount}
      Icon={Icon.Calendar}
      onPress={onPress}
      text={text ?? texts.widgets.events}
    />
  );
};
