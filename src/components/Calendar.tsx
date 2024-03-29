import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import _uniqBy from 'lodash/uniqBy';
import moment from 'moment';
import 'moment/locale/de';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { CalendarProps, Calendar as RNCalendar } from 'react-native-calendars';
import { DateData } from 'react-native-calendars/src/types';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, normalize, texts } from '../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../helpers';
import { setupLocales } from '../helpers/calendarHelper';
import { QUERY_TYPES, getFetchMoreQuery, getQuery } from '../queries';
import { ScreenName } from '../types';

import { DayComponent } from './DayComponent';
import { EmptyMessage } from './EmptyMessage';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { renderArrow } from './calendarArrows';

setupLocales();

const { CALENDAR, ROOT_ROUTE_NAMES } = consts;
const { DOT_SIZE, MAX_DOTS_PER_DAY } = CALENDAR;

type Props = {
  additionalData?: any;
  isListRefreshing: boolean;
  navigation: StackNavigationProp<any>;
  query: string;
  queryVariables: { contentContainerId?: number; dateRange?: string[] };
};

const today = moment().format('YYYY-MM-DD');

export const Calendar = ({
  additionalData,
  isListRefreshing,
  navigation,
  query,
  queryVariables
}: Props) => {
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { eventCalendar = {} } = settings;
  const { dotCount = MAX_DOTS_PER_DAY, subList = false } = eventCalendar;
  const [queryVariablesWithDateRange, setQueryVariablesWithDateRange] = useState<any>({
    ...queryVariables,
    dateRange: [today, today]
  });
  const [refreshing, setRefreshing] = useState(false);
  const contentContainerId = queryVariables.contentContainerId;
  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const { data, loading, refetch } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    skip: query !== QUERY_TYPES.EVENT_RECORDS,
    variables: {
      ...queryVariables,
      // if we show the calendar, we need to fetch all the entries at once and not a limited amount
      limit: undefined
    }
  });

  const {
    data: dataDateRange,
    loading: loadingDateRange,
    refetch: refetchDateRange,
    fetchMore: fetchMoreDateRange
  } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    skip: query !== QUERY_TYPES.EVENT_RECORDS || !subList,
    variables: queryVariablesWithDateRange
  });

  const onDayPress = useCallback(
    (day: DateData) => {
      if (query === QUERY_TYPES.EVENT_RECORDS) {
        if (subList) {
          setQueryVariablesWithDateRange({
            ...queryVariables,
            dateRange: [day.dateString, day.dateString]
          });
        } else {
          navigation.push(ScreenName.Index, {
            title: texts.homeTitles.events,
            query,
            queryVariables: { ...queryVariables, dateRange: [day.dateString, day.dateString] },
            rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
          });
        }
      } else {
        navigation.push(ScreenName.VolunteerIndex, {
          title: texts.volunteer.events,
          query,
          queryVariables: { dateRange: [day.dateString], contentContainerId },
          rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
        });
      }
    },
    [query, queryVariables, data, contentContainerId]
  );

  const selectedDay = useMemo(() => {
    if (!queryVariablesWithDateRange?.dateRange?.length) {
      return today;
    }

    return queryVariablesWithDateRange.dateRange[0];
  }, [queryVariablesWithDateRange]);

  const markedDates = useMemo(() => {
    const dates: CalendarProps['markedDates'] = {};

    const eventRecords = data?.[query] || [];

    if (additionalData?.length) {
      eventRecords?.push(...additionalData);
    }

    if (eventRecords?.length) {
      eventRecords.forEach((item: { listDate: string; color: string }) => {
        if (item.listDate) {
          const dots = dates[item.listDate]?.dots || [];

          if (!dots.length || dots.length < dotCount) {
            dates[item.listDate] = {
              marked: true,
              dots: [...dots, { color: item.color || colors.primary }]
            };
          }
        }
      });
    }

    // highlight selected day
    dates[selectedDay] = {
      ...(dates[selectedDay] ?? {}),
      selected: true,
      selectedColor: colors.lighterPrimary
    };

    return dates;
  }, [additionalData, data, dotCount, query, selectedDay]);

  const listItems = useMemo(() => {
    if (!subList) return [];

    const parsedListItems = parseListItemsFromQuery(
      QUERY_TYPES.EVENT_RECORDS,
      dataDateRange,
      undefined,
      {
        withDate: false
      }
    );

    if (additionalData?.length) {
      const filteredAdditionalData = additionalData.filter((item) => item.listDate === selectedDay);

      parsedListItems.push(...filteredAdditionalData);
    }

    return parsedListItems;
  }, [additionalData, dataDateRange, query, selectedDay, subList]);

  const refresh = useCallback(
    async (withCalendar = true) => {
      setRefreshing(true);
      if (isConnected) {
        withCalendar && (await refetch());
        await refetchDateRange();
      }
      setRefreshing(false);
    },
    [isConnected, refetch, refetchDateRange]
  );

  useEffect(() => {
    refetchDateRange();
  }, [selectedDay]);

  useEffect(() => {
    if (isListRefreshing) {
      refresh();
    }
  }, [isListRefreshing]);

  useEffect(() => {
    setQueryVariablesWithDateRange({
      ...queryVariables,
      dateRange: queryVariablesWithDateRange.dateRange
    });
  }, [queryVariables]);

  useFocusEffect(
    useCallback(() => {
      refresh(false);
    }, [refresh])
  );

  const fetchMoreData = () =>
    fetchMoreDateRange({
      query: getFetchMoreQuery(query),
      variables: {
        ...queryVariablesWithDateRange,
        offset: queryVariablesWithDateRange.limit
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[query]?.length) return prevResult;

        const uniqueData = _uniqBy([...prevResult[query], ...fetchMoreResult[query]], 'id');

        return {
          ...prevResult,
          [query]: uniqueData
        };
      }
    });

  return (
    <>
      <RNCalendar
        dayComponent={DayComponent}
        displayLoadingIndicator={loading || refreshing}
        firstDay={1}
        markedDates={markedDates}
        markingType="multi-dot"
        onDayPress={onDayPress}
        renderArrow={renderArrow}
        theme={{
          todayTextColor: colors.primary,
          indicatorColor: colors.primary,
          dotStyle: {
            borderRadius: DOT_SIZE / 2,
            height: DOT_SIZE,
            width: DOT_SIZE
          }
        }}
      />

      {subList && (
        <ListComponent
          data={loadingDateRange || refreshing ? [] : listItems}
          fetchMoreData={fetchMoreData}
          ListEmptyComponent={
            loadingDateRange || refreshing ? (
              <LoadingContainer>
                <ActivityIndicator color={colors.refreshControl} />
              </LoadingContainer>
            ) : (
              <EmptyMessage title={texts.empty.list} />
            )
          }
          ListHeaderComponent={<View style={{ height: normalize(20) }} />}
          navigation={navigation}
          query={query}
          queryVariables={queryVariables}
          sectionByDate
        />
      )}
    </>
  );
};
