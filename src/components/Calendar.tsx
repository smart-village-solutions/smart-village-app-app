import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import 'moment/locale/de';
import React, { useCallback, useContext, useState } from 'react';
import { useQuery } from 'react-apollo';
import { ActivityIndicator, View } from 'react-native';
import { CalendarProps, Calendar as RNCalendar } from 'react-native-calendars';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';
import { DateData } from 'react-native-calendars/src/types';

import { NetworkContext } from '../NetworkProvider';
import { SettingsContext } from '../SettingsProvider';
import { colors, consts, normalize, texts } from '../config';
import { graphqlFetchPolicy, parseListItemsFromQuery } from '../helpers';
import { setupLocales } from '../helpers/calendarHelper';
import { QUERY_TYPES, getFetchMoreQuery, getQuery } from '../queries';
import { ScreenName, Calendar as TCalendar } from '../types';

import { EmptyMessage } from './EmptyMessage';
import { ListComponent } from './ListComponent';
import { LoadingContainer } from './LoadingContainer';
import { renderArrow } from './calendarArrows';

const { ROOT_ROUTE_NAMES } = consts;

const DayComponent = (props: BasicDayProps & { date?: DateData }) => (
  <BasicDay
    {...props}
    date={props?.date?.dateString}
    marking={{ ...props.marking, disableTouchEvent: !props.marking?.marked }}
  />
);

type Props = {
  query: string;
  queryVariables?: { dateRange?: string[]; contentContainerId?: number };
  calendarData: TCalendar[];
  isLoading: boolean;
  navigation: StackNavigationProp<any>;
};

const DOT_SIZE = 6;
const MAX_DOTS_PER_DAY = 5;

setupLocales();

const getMarkedDates = (data?: any[], dotCount: number = MAX_DOTS_PER_DAY, selectedDay: string) => {
  const markedDates: CalendarProps['markedDates'] = {};

  data?.forEach((item) => {
    if (
      !!item.listDate &&
      (!markedDates?.[item?.listDate]?.dots ||
        markedDates?.[item?.listDate]?.dots?.length < dotCount)
    ) {
      markedDates[item?.listDate] = {
        marked: true,
        dots: [
          ...(markedDates[item?.listDate]?.dots ?? []),
          { color: item.color || colors.primary }
        ]
      };
    }
  });

  // highlight today
  markedDates[selectedDay] = {
    ...(markedDates[selectedDay] ?? {}),
    selected: true,
    selectedColor: colors.lighterPrimary
  };

  return markedDates;
};

export const Calendar = ({ query, queryVariables, calendarData, isLoading, navigation }: Props) => {
  const contentContainerId = queryVariables?.contentContainerId;
  const { isConnected, isMainserverUp } = useContext(NetworkContext);
  const today = moment().format('YYYY-MM-DD');
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { eventCalendar = {} } = settings;
  const { dotCount, subList = false } = eventCalendar;

  const fetchPolicy = graphqlFetchPolicy({ isConnected, isMainserverUp });

  const [queryVariableWithDateRange, setQueryVariableWithDateRange] = useState<any>({
    ...queryVariables,
    dateRange: [today, today]
  });
  const [markedDates, setMarkedDates] = useState<CalendarProps['markedDates']>(
    getMarkedDates(calendarData, dotCount, today)
  );

  const { data, loading, refetch, fetchMore } = useQuery(getQuery(QUERY_TYPES.EVENT_RECORDS), {
    fetchPolicy,
    variables: queryVariableWithDateRange,
    skip: !subList
  });

  const fetchMoreData = () =>
    fetchMore({
      query: getFetchMoreQuery(query),
      variables: {
        ...queryVariableWithDateRange,
        offset: data?.[query]?.length
      },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult || !fetchMoreResult[query].length) return prevResult;

        return {
          ...prevResult,
          [query]: [...prevResult[query], ...fetchMoreResult[query]]
        };
      }
    });

  const onDayPress = useCallback(
    async (day: DateData) => {
      if (query === QUERY_TYPES.EVENT_RECORDS) {
        if (subList) {
          setQueryVariableWithDateRange({
            ...queryVariables,
            dateRange: [day.dateString, day.dateString]
          });
          setMarkedDates(getMarkedDates(calendarData, dotCount, day.dateString));

          await refetch();

          return;
        }

        return navigation.push(ScreenName.Index, {
          title: texts.homeTitles.events,
          query,
          queryVariables: { ...queryVariables, dateRange: [day.dateString, day.dateString] },
          rootRouteName: ROOT_ROUTE_NAMES.EVENT_RECORDS
        });
      }

      navigation.push(ScreenName.VolunteerIndex, {
        title: texts.volunteer.events,
        query,
        queryVariables: { dateRange: [day.dateString], contentContainerId },
        rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
      });
    },
    [navigation, query, queryVariables, calendarData, contentContainerId]
  );

  const buildListItems = useCallback(
    (data: DateData) =>
      parseListItemsFromQuery(query, data, '', {
        queryVariables: queryVariableWithDateRange,
        withDate: false
      }),
    [query, queryVariableWithDateRange]
  );

  return (
    <>
      <RNCalendar
        dayComponent={DayComponent}
        onDayPress={onDayPress}
        displayLoadingIndicator={isLoading}
        markedDates={markedDates}
        markingType="multi-dot"
        renderArrow={renderArrow}
        firstDay={1}
        theme={{
          todayTextColor: colors.primary,
          indicatorColor: colors.primary,
          dotStyle: {
            borderRadius: DOT_SIZE / 2,
            height: DOT_SIZE,
            width: DOT_SIZE
          }
        }}
        enableSwipeMonths
      />

      {subList && (
        <ListComponent
          data={loading ? [] : buildListItems(data)}
          fetchMoreData={fetchMoreData}
          ListEmptyComponent={
            loading ? (
              <LoadingContainer>
                <ActivityIndicator color={colors.accent} />
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
