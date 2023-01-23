import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import 'moment/locale/de';
import React, { useCallback } from 'react';
import { Calendar as RNCalendar, CalendarProps, DateData } from 'react-native-calendars';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';

import { colors, consts, texts } from '../config';
import { setupLocales } from '../helpers';
import { QUERY_TYPES } from '../queries';
import { Calendar as TCalendar, ScreenName } from '../types';

import { renderArrow } from './calendarArrows';

const { ROOT_ROUTE_NAMES } = consts;

const DayComponent = (props: BasicDayProps) => (
  <BasicDay {...props} marking={{ ...props.marking, disableTouchEvent: !props.marking?.marked }} />
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

const getMarkedDates = (data?: any[]) => {
  const markedDates: CalendarProps['markedDates'] = {};

  data?.forEach((item) => {
    if (
      !!item.listDate &&
      (!markedDates?.[item?.listDate]?.dots ||
        markedDates?.[item?.listDate]?.dots?.length < MAX_DOTS_PER_DAY)
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

  const today = moment().format('YYYY-MM-DD');

  // highlight today
  markedDates[today] = {
    ...(markedDates[today] ?? {}),
    selected: true,
    selectedColor: colors.lighterPrimary
  };

  return markedDates;
};

export const Calendar = ({ query, queryVariables, calendarData, isLoading, navigation }: Props) => {
  const contentContainerId = queryVariables?.contentContainerId;

  const onDayPress = useCallback(
    (day: DateData) => {
      if (query === QUERY_TYPES.EVENT_RECORDS) {
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

  return (
    <RNCalendar
      dayComponent={DayComponent}
      onDayPress={onDayPress}
      displayLoadingIndicator={isLoading}
      markedDates={getMarkedDates(calendarData)}
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
  );
};
