import { useFocusEffect } from 'expo-router/react-navigation';
import { StackNavigationProp } from 'expo-router/js-stack';
import moment from 'moment';
import 'moment/locale/de';
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, DeviceEventEmitter, StyleProp, View, ViewStyle } from 'react-native';
import { CalendarProps, Calendar as RNCalendar } from 'react-native-calendars';
import { DateData, Direction } from 'react-native-calendars/src/types';
import { useInfiniteQuery, useQuery } from 'react-query';

import { NetworkContext } from '../NetworkProvider';
import { ReactQueryClient } from '../ReactQueryClient';
import { SettingsContext } from '../SettingsProvider';
import { consts, normalize, texts } from '../config';
import {
  parseListItemsFromQuery,
  volunteerEventDates,
  volunteerEventOverlapsDate
} from '../helpers';
import { getCalendarTheme, setupLocales } from '../helpers/calendarHelper';
import { useVolunteerData } from '../hooks';
import { QUERY_TYPES, getQuery } from '../queries';
import { ScreenName, VolunteerQuery } from '../types';
import type { VolunteerCalendarDateRange, VolunteerDateRange } from '../types';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { DayComponent } from './DayComponent';
import { EmptyMessage } from './EmptyMessage';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { renderArrow } from './calendarArrows';

setupLocales();

const { CALENDAR, EVENT_SUGGESTION_BUTTON, ROOT_ROUTE_NAMES } = consts;
const { DOT_SIZE, MAX_DOTS_PER_DAY } = CALENDAR;
export const REFRESH_CALENDAR = 'REFRESH_CALENDAR';

type Props = {
  additionalData?: any;
  eventListIntro?: { buttonType: string };
  isListRefreshing: boolean;
  includeVolunteerEvents?: boolean;
  navigation: StackNavigationProp<any>;
  onDateRangeChange?: (dateRange: VolunteerCalendarDateRange) => void;
  query: string;
  queryVariables: { contentContainerId?: number; dateRange?: VolunteerDateRange; limit?: number };
  subListContainerStyle?: StyleProp<ViewStyle>;
};

const today = moment().format('YYYY-MM-DD');
// end of month plus seven days to have dates for overlapping days in the calendar
const endOfMonth = moment().endOf('month').add(7, 'days').format('YYYY-MM-DD');

/* eslint-disable complexity */
export const Calendar = ({
  additionalData,
  eventListIntro,
  includeVolunteerEvents = false,
  isListRefreshing,
  navigation,
  onDateRangeChange,
  query,
  queryVariables,
  subListContainerStyle
}: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const { isConnected } = useContext(NetworkContext);
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
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
  const loadVolunteerCalendar = query === QUERY_TYPES.EVENT_RECORDS && includeVolunteerEvents;
  const isInitialFocus = useRef(true);
  const focusRefresh = useRef<() => void>(() => undefined);

  const {
    data,
    isLoading: loading,
    refetch,
    isRefetching
  } = useQuery(
    [QUERY_TYPES.EVENT_RECORDS, queryVariablesWithDateRange],
    async () => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.EVENT_RECORDS), queryVariablesWithDateRange);
    },
    {
      enabled: query === QUERY_TYPES.EVENT_RECORDS,
      keepPreviousData: true
    }
  );
  const {
    data: volunteerCalendarData,
    isLoading: loadingVolunteerCalendar,
    isRefetching: isRefetchingVolunteerCalendar,
    refetch: refetchVolunteerCalendar
  } = useVolunteerData({
    query:
      query === QUERY_TYPES.EVENT_RECORDS
        ? QUERY_TYPES.VOLUNTEER.CALENDAR_ALL
        : (query as VolunteerQuery),
    queryVariables: queryVariablesWithDateRange,
    queryOptions: { enabled: loadVolunteerCalendar, keepPreviousData: true },
    isCalendar: true,
    isSectioned: true,
    onlyUpcoming: false
  });

  const {
    data: dataSubList,
    isLoading: loadingSubList,
    refetch: refetchSubList,
    isRefetching: isRefetchingSubList,
    fetchNextPage: fetchNextPageSubList,
    hasNextPage: hasNextPageSubList
  } = useInfiniteQuery(
    [QUERY_TYPES.EVENT_RECORDS, queryVariablesWithDateRangeSubList],
    async ({ pageParam = 0 }) => {
      const client = await ReactQueryClient();

      return await client.request(getQuery(QUERY_TYPES.EVENT_RECORDS), {
        ...queryVariablesWithDateRangeSubList,
        offset: pageParam
      });
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
    [query, subList, queryVariables, navigation, contentContainerId]
  );

  const onMonthChange = useCallback(
    (month: DateData) => {
      const isCurrentMonth = moment(month.dateString).isSame(moment(), 'month');

      const dateRange: VolunteerCalendarDateRange = [
        isCurrentMonth
          ? today
          : moment(month.dateString).startOf('month').subtract(7, 'days').format('YYYY-MM-DD'),
        moment(month.dateString).endOf('month').add(7, 'days').format('YYYY-MM-DD')
      ];

      setQueryVariablesWithDateRange({
        ...queryVariablesWithDateRange,
        dateRange,
        limit: undefined
      });
      onDateRangeChange?.(dateRange);
    },
    [onDateRangeChange, queryVariablesWithDateRange]
  );

  const selectedDay = useMemo(() => {
    if (!queryVariablesWithDateRangeSubList?.dateRange?.length) {
      return today;
    }

    return queryVariablesWithDateRangeSubList.dateRange[0];
  }, [queryVariablesWithDateRangeSubList]);

  const markedDates = useMemo(() => {
    const dates: CalendarProps['markedDates'] = {};
    const eventRecords =
      query === QUERY_TYPES.EVENT_RECORDS
        ? [
            ...(data?.[query] || []),
            ...(additionalData || []),
            ...(includeVolunteerEvents ? volunteerCalendarData || [] : [])
          ]
        : additionalData;

    if (eventRecords?.length) {
      eventRecords.forEach(
        (item: {
          all_day?: number;
          color: string;
          end_datetime?: string;
          listDate: string;
          start_datetime?: string;
        }) => {
          const eventDates = volunteerEventDates(item);
          const datesToMark = eventDates.length ? eventDates : [item.listDate].filter(Boolean);

          datesToMark.forEach((date) => {
            const dots = dates[date]?.dots || [];

            if (!dots.length || dots.length < dotCount) {
              dates[date] = {
                marked: true,
                dots: [...dots, { color: item.color || colors.primary }]
              };
            }
          });
        }
      );
    }

    // highlight selected day
    dates[selectedDay] = {
      ...(dates[selectedDay] ?? {}),
      selected: true,
      selectedColor: colors.calendarSelected
    };

    return dates;
  }, [
    additionalData,
    colors.calendarSelected,
    colors.primary,
    data,
    dotCount,
    includeVolunteerEvents,
    query,
    selectedDay,
    volunteerCalendarData
  ]);

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

    const calendarAdditionalData = [
      ...(additionalData || []),
      ...(includeVolunteerEvents ? volunteerCalendarData || [] : [])
    ];

    if (calendarAdditionalData.length) {
      const filteredAdditionalData = calendarAdditionalData.filter(
        (item) => volunteerEventOverlapsDate(item, selectedDay) || item.listDate === selectedDay
      );

      parsedListItems.push(...filteredAdditionalData);
    }

    return parsedListItems;
  }, [
    additionalData,
    dataSubList,
    includeVolunteerEvents,
    query,
    selectedDay,
    subList,
    volunteerCalendarData
  ]);

  const refresh = useCallback(async () => {
    if (isConnected) {
      if (query === QUERY_TYPES.EVENT_RECORDS) {
        await refetch();
        if (includeVolunteerEvents) await refetchVolunteerCalendar();
      }
      if (query === QUERY_TYPES.EVENT_RECORDS && subList) {
        await refetchSubList();
      }
    }
  }, [
    includeVolunteerEvents,
    isConnected,
    query,
    refetch,
    refetchSubList,
    refetchVolunteerCalendar,
    subList
  ]);

  useEffect(() => {
    setQueryVariablesWithDateRange({
      ...queryVariables,
      dateRange: queryVariablesWithDateRange.dateRange,
      limit: undefined
    });

    subList &&
      setQueryVariablesWithDateRangeSubList({
        ...queryVariables,
        dateRange: queryVariablesWithDateRangeSubList.dateRange
      });
  }, [queryVariables]);

  focusRefresh.current = () => {
    if (query === QUERY_TYPES.EVENT_RECORDS) {
      refetch();
      if (includeVolunteerEvents) refetchVolunteerCalendar();
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (isInitialFocus.current) {
        isInitialFocus.current = false;

        return;
      }

      focusRefresh.current();
    }, [])
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
  }, [dataSubList, fetchNextPageSubList, hasNextPageSubList, query]);

  const disableArrowLeft =
    moment().endOf('month').add(7, 'days').format('YYYY-MM-DD') ===
    queryVariablesWithDateRange.dateRange[1];

  return (
    <>
      <RNCalendar
        dayComponent={DayComponent}
        disableArrowLeft={disableArrowLeft}
        displayLoadingIndicator={
          isListRefreshing ||
          loading ||
          (loadVolunteerCalendar && loadingVolunteerCalendar) ||
          isRefetching ||
          isRefetchingSubList ||
          (loadVolunteerCalendar && isRefetchingVolunteerCalendar)
        }
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
          ...getCalendarTheme(colors),
          dotStyle: {
            borderRadius: DOT_SIZE / 2,
            height: DOT_SIZE,
            marginBottom: normalize(8),
            marginTop: normalize(8),
            width: DOT_SIZE
          }
        }}
        style={styles.noPaddingLeftAndRight}
      />

      {subList && (
        <ListComponent
          containerStyle={subListContainerStyle}
          data={listItems}
          fetchMoreData={fetchMoreData}
          ListFooterComponent={() => {
            if (loadingSubList || isRefetchingSubList) {
              return (
                <LoadingContainer>
                  <ActivityIndicator color={colors.refreshControl} />
                </LoadingContainer>
              );
            }

            if (eventListIntro?.buttonType == EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING) {
              return <View style={styles.spacer} />;
            }

            return null;
          }}
          ListEmptyComponent={
            <>
              <EmptyMessage title={texts.empty.list} />
              {eventListIntro?.buttonType === EVENT_SUGGESTION_BUTTON.BOTTOM_FLOATING && (
                <View style={styles.spacer} />
              )}
            </>
          }
          ListHeaderComponent={<View style={styles.spacerSmall} />}
          navigation={navigation}
          query={query}
          queryVariables={queryVariables}
        />
      )}
    </>
  );
};
/* eslint-enable complexity */

const createStyles = () => ({
  spacer: {
    height: normalize(70)
  },

  spacerSmall: {
    height: normalize(20)
  },

  noPaddingLeftAndRight: {
    paddingLeft: 0,
    paddingRight: 0
  }
});
