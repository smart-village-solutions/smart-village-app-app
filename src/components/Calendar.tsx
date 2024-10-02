import { useFocusEffect } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import 'moment/locale/de';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, View } from 'react-native';
import { CalendarProps, Calendar as RNCalendar } from 'react-native-calendars';
import { DateData, Direction } from 'react-native-calendars/src/types';
import { useInfiniteQuery, useQuery } from 'react-query';

import { NetworkContext } from '../NetworkProvider';
import { ReactQueryClient } from '../ReactQueryClient';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, normalize, texts } from '../config';
import { parseListItemsFromQuery } from '../helpers';
import { setupLocales } from '../helpers/calendarHelper';
import { QUERY_TYPES, getQuery } from '../queries';
import { ScreenName } from '../types';

import { DayComponent } from './DayComponent';
import { EmptyMessage } from './EmptyMessage';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { renderArrow } from './calendarArrows';

setupLocales();

const { CALENDAR, ROOT_ROUTE_NAMES } = consts;
const { DOT_SIZE, MAX_DOTS_PER_DAY } = CALENDAR;
export const REFRESH_CALENDAR = 'REFRESH_CALENDAR';

type Props = {
  additionalData?: any;
  isListRefreshing: boolean;
  navigation: StackNavigationProp<any>;
  query: string;
  queryVariables: { contentContainerId?: number; dateRange?: string[]; limit?: number };
};

const today = moment().format('YYYY-MM-DD');
// end of month plus seven days to have dates for overlapping days in the calendar
const endOfMonth = moment().endOf('month').add(7, 'days').format('YYYY-MM-DD');

/* eslint-disable complexity */
export const Calendar = ({ additionalData, navigation, query, queryVariables }: Props) => {
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { deprecated = {}, settings = {} } = globalSettings;
  const { eventCalendar = {} } = settings;
  const { dotCount = MAX_DOTS_PER_DAY, subList = false } = eventCalendar;
  const [queryVariablesWithDateRange, setQueryVariablesWithDateRange] = useState<any>({
    ...queryVariables,
    dateRange: [today, endOfMonth],
    limit: undefined // showing the calendar, need to fetch all the entries at once without a limit
  });
  const [queryVariablesWithDateRangeSubList, setQueryVariablesWithDateRangeSubList] = useState<any>(
    {
      ...queryVariables,
      dateRange: [today, today]
    }
  );
  const contentContainerId = queryVariables.contentContainerId;

  const {
    data,
    isLoading: loading,
    refetch,
    isRefetching
  } = useQuery(
    [
      deprecated?.events?.listingWithoutDateFragment
        ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
        : QUERY_TYPES.EVENT_RECORDS,
      queryVariablesWithDateRange
    ],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(
        getQuery(
          deprecated?.events?.listingWithoutDateFragment
            ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
            : QUERY_TYPES.EVENT_RECORDS
        ),
        queryVariablesWithDateRange
      );
    },
    {
      enabled: query === QUERY_TYPES.EVENT_RECORDS,
      keepPreviousData: true
    }
  );

  const {
    data: dataSubList,
    isLoading: loadingSubList,
    refetch: refetchSubList,
    isRefetching: isRefetchingSubList,
    fetchNextPage: fetchNextPageSubList,
    hasNextPage: hasNextPageSubList
  } = useInfiniteQuery(
    [
      deprecated?.events?.listingWithoutDateFragment
        ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
        : QUERY_TYPES.EVENT_RECORDS,
      queryVariablesWithDateRangeSubList
    ],
    async ({ pageParam = 0 }) => {
      const client = await ReactQueryClient();

      return await client.request(
        getQuery(
          deprecated?.events?.listingWithoutDateFragment
            ? QUERY_TYPES.EVENT_RECORDS_WITHOUT_DATE_FRAGMENT
            : QUERY_TYPES.EVENT_RECORDS
        ),
        {
          ...queryVariablesWithDateRangeSubList,
          offset: pageParam
        }
      );
    },
    {
      enabled: query === QUERY_TYPES.EVENT_RECORDS && subList,
      getNextPageParam: (lastPage, allPages) => {
        if (
          lastPage?.[QUERY_TYPES.EVENT_RECORDS]?.length < queryVariablesWithDateRangeSubList.limit
        ) {
          return undefined;
        }

        return allPages.length * queryVariablesWithDateRangeSubList.limit;
      }
    }
  );

  const onDayPress = useCallback(
    (day: DateData) => {
      if (query === QUERY_TYPES.EVENT_RECORDS) {
        if (subList) {
          setQueryVariablesWithDateRangeSubList({
            ...queryVariables,
            dateRange: [day.dateString, day.dateString]
          });
        } else {
          navigation.push(ScreenName.Index, {
            title: texts.homeTitles.events,
            query,
            queryVariables: { ...queryVariables, dateRange: [day.dateString, day.dateString] },
            rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS,
            showFilterByDailyEvents: false
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
    [query, queryVariables, contentContainerId]
  );

  const onMonthChange = useCallback(
    (month: DateData) => {
      const isCurrentMonth = moment(month.dateString).isSame(moment(), 'month');

      setQueryVariablesWithDateRange({
        ...queryVariablesWithDateRange,
        dateRange: [
          isCurrentMonth
            ? today
            : moment(month.dateString).startOf('month').subtract(7, 'days').format('YYYY-MM-DD'),
          moment(month.dateString).endOf('month').add(7, 'days').format('YYYY-MM-DD')
        ]
      });
    },
    [queryVariablesWithDateRange]
  );

  const selectedDay = useMemo(() => {
    if (!queryVariablesWithDateRangeSubList?.dateRange?.length) {
      return today;
    }

    return queryVariablesWithDateRangeSubList.dateRange[0];
  }, [queryVariablesWithDateRangeSubList]);

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
  }, [additionalData, data, dotCount, query, queryVariablesWithDateRange, selectedDay]);

  const listItems = useMemo(() => {
    if (!subList) return [];

    const parsedListItems =
      parseListItemsFromQuery(
        QUERY_TYPES.EVENT_RECORDS,
        {
          [query]: dataSubList?.pages?.flatMap((page) => page?.[query])
        },
        undefined,
        {
          withDate: false,
          withTime: true
        }
      ) || [];

    if (additionalData?.length) {
      const filteredAdditionalData = additionalData.filter((item) => item.listDate === selectedDay);

      parsedListItems.push(...filteredAdditionalData);
    }

    return parsedListItems;
  }, [additionalData, dataSubList, query, selectedDay, subList]);

  const refresh = useCallback(async () => {
    if (isConnected) {
      await refetch();
      await refetchSubList();
    }
  }, [isConnected, refetch, refetchSubList]);

  useEffect(() => {
    refetchSubList();
  }, [selectedDay]);

  useEffect(() => {
    setQueryVariablesWithDateRange({
      ...queryVariables,
      dateRange: queryVariablesWithDateRange.dateRange
    });

    subList &&
      setQueryVariablesWithDateRangeSubList({
        ...queryVariables,
        dateRange: queryVariablesWithDateRangeSubList.dateRange
      });
  }, [queryVariables]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useEffect(() => {
    const subscription = DeviceEventEmitter.addListener(REFRESH_CALENDAR, refresh);

    return () => subscription.remove();
  }, [refresh]);

  const fetchMoreData = useCallback(() => {
    if (hasNextPageSubList) {
      return fetchNextPageSubList();
    }

    return { data: { [query]: [] } };
  }, [dataSubList, fetchNextPageSubList, hasNextPageSubList]);

  const disableArrowLeft =
    moment().endOf('month').add(7, 'days').format('YYYY-MM-DD') ===
    queryVariablesWithDateRange.dateRange[1];

  return (
    <>
      <RNCalendar
        dayComponent={DayComponent}
        disableArrowLeft={disableArrowLeft}
        displayLoadingIndicator={loading || isRefetching || isRefetchingSubList}
        firstDay={1}
        markedDates={markedDates}
        markingType="multi-dot"
        minDate={today}
        onDayPress={onDayPress}
        onMonthChange={onMonthChange}
        renderArrow={(direction: Direction) =>
          renderArrow(
            direction,
            disableArrowLeft && direction == 'left' ? colors.placeholder : undefined
          )
        }
        theme={{
          todayTextColor: colors.primary,
          indicatorColor: colors.refreshControl,
          dotStyle: {
            borderRadius: DOT_SIZE / 2,
            height: DOT_SIZE,
            width: DOT_SIZE
          }
        }}
      />

      {subList && (
        <ListComponent
          contentContainerStyle={{ paddingHorizontal: normalize(1) }}
          data={loadingSubList || isRefetchingSubList ? [] : listItems}
          fetchMoreData={fetchMoreData}
          ListEmptyComponent={
            loadingSubList || isRefetchingSubList ? (
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
/* eslint-enable complexity */
