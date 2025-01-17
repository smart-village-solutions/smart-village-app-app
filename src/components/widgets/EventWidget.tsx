import { useNavigation } from '@react-navigation/core';
import moment from 'moment';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-query';

import { consts, Icon, texts } from '../../config';
import { useHomeRefresh, useVolunteerData } from '../../hooks';
import { getQuery, QUERY_TYPES } from '../../queries';
import { ReactQueryClient } from '../../ReactQueryClient';
import { SettingsContext } from '../../SettingsProvider';
import { ScreenName, WidgetProps } from '../../types';

import { DefaultWidget } from './DefaultWidget';

const { ROOT_ROUTE_NAMES } = consts;

const today = moment().format('YYYY-MM-DD');

export const EventWidget = ({ text, additionalProps }: WidgetProps) => {
  const navigation = useNavigation();
  const { globalSettings } = useContext(SettingsContext);
  const { deprecated = {}, hdvt = {} } = globalSettings;
  const { events: showVolunteerEvents = false } = hdvt as { events?: boolean };
  const [queryVariables] = useState<{ dateRange?: string[]; order?: string }>(
    additionalProps?.noFilterByDailyEvents
      ? { order: 'listDate_ASC' }
      : {
          dateRange: [today, today],
          order: 'listDate_ASC'
        }
  );

  const {
    data,
    isLoading: loading,
    refetch
  } = useQuery([QUERY_TYPES.EVENT_RECORDS_COUNT, queryVariables], async () => {
    const client = await ReactQueryClient();

    return await client.request(getQuery(QUERY_TYPES.EVENT_RECORDS_COUNT), queryVariables);
  });

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
        order: 'listDate_ASC',
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
