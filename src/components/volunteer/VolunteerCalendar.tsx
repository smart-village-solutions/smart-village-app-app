import { StackNavigationProp } from '@react-navigation/stack';
import moment from 'moment';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';

import { colors, consts, normalize, texts } from '../../config';
import { setupLocales, volunteerListDate } from '../../helpers';
import { ScreenName } from '../../types';
import { renderArrow } from '../calendarArrows';

const { ROOT_ROUTE_NAMES } = consts;

const DayComponent = (props: BasicDayProps) => (
  <BasicDay {...props} marking={{ ...props.marking, disableTouchEvent: !props.marking }} />
);

type Props = {
  query: string;
  calendarData: any[];
  isLoading: boolean;
  navigation: StackNavigationProp<any>;
};

const dotSize = 6;

setupLocales();

const getMarkedDates = (data?: any[]) => {
  const markedDates: CalendarProps['markedDates'] = {};

  data?.forEach((item) => {
    markedDates[volunteerListDate(item)] = {
      marked: true,
      dots: [
        ...(markedDates[volunteerListDate(item)]?.dots ?? []),
        { color: item.color || colors.primary }
      ]
    };
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

export const VolunteerCalendar = ({ query, calendarData, isLoading, navigation }: Props) => (
  <View style={styles.topMarginContainer}>
    <Calendar
      dayComponent={DayComponent}
      onDayPress={(day) =>
        navigation.navigate({
          name: ScreenName.VolunteerIndex,
          params: {
            title: texts.volunteer.calendar,
            query,
            queryVariables: { dateRange: [day.dateString] },
            rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
          }
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
          borderRadius: dotSize / 2,
          height: dotSize,
          width: dotSize
        }
      }}
    />
    {/* TODO: show dot with color for the different calendars available */}
    {/* <WasteCalendarLegend data={usedTypes} /> */}
  </View>
);

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
