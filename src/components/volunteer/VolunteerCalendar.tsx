import { StackNavigationProp } from '@react-navigation/stack';
import _isNumber from 'lodash/isNumber';
import moment from 'moment';
import 'moment/locale/de';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';

import { colors, consts, normalize, texts } from '../../config';
import { setupLocales } from '../../helpers';
import { ScreenName, VolunteerCalendar as TVolunteerCalendar } from '../../types';
import { renderArrow } from '../calendarArrows';

const { ROOT_ROUTE_NAMES } = consts;

const DayComponent = (props: BasicDayProps) => (
  <BasicDay {...props} marking={{ ...props.marking, disableTouchEvent: !props.marking?.marked }} />
);

type Props = {
  query: string;
  queryVariables?: { dateRange?: string[]; contentContainerId?: number };
  calendarData: TVolunteerCalendar[];
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

export const VolunteerCalendar = ({
  query,
  queryVariables,
  calendarData,
  isLoading,
  navigation
}: Props) => {
  const contentContainerId = queryVariables?.contentContainerId;

  return (
    <View style={styles.topMarginContainer}>
      <Calendar
        dayComponent={DayComponent}
        onDayPress={(day) =>
          navigation.push(ScreenName.VolunteerIndex, {
            title: texts.volunteer.calendar,
            query,
            queryVariables: { dateRange: [day.dateString], contentContainerId },
            rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
          })
        }
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
      {/* TODO: show dot with color for the different calendars available */}
      {/* <WasteCalendarLegend data={usedTypes} /> */}
    </View>
  );
};

const styles = StyleSheet.create({
  topMarginContainer: {
    ...Platform.select({
      android: {
        marginTop: normalize(44)
      },
      ios: {}
    })
  }
});
