import { DrawerNavigationProp } from '@react-navigation/drawer';
import moment from 'moment';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';

import { colors, consts, normalize } from '../../config';
import { setupLocales } from '../../helpers';
import { myCalendar } from '../../helpers/parser/volunteer';
import { QUERY_TYPES } from '../../queries';
import { ScreenName } from '../../types';
import { renderArrow } from '../calendarArrows';

const { ROOT_ROUTE_NAMES } = consts;

const DayComponent = (props: BasicDayProps) => (
  <BasicDay {...props} marking={{ ...props.marking, disableTouchEvent: !props.marking }} />
);

type Props = {
  navigation: DrawerNavigationProp<any>;
};

const dotSize = 6;

setupLocales();

const getMarkedDates = () => {
  const markedDates = {};

  myCalendar().forEach((appointment) => {
    markedDates[appointment.listDate] = {
      marked: true,
      dots: [
        ...(markedDates[appointment.listDate]?.dots ?? []),
        { color: appointment.color || colors.primary }
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

export const VolunteerCalendar = ({ navigation }: Props) => {
  return (
    <View style={styles.topMarginContainer}>
      <Calendar
        dayComponent={DayComponent}
        onDayPress={(day) =>
          navigation.navigate({
            name: ScreenName.VolunteerIndex,
            params: {
              title: 'Mein Kalender',
              query: QUERY_TYPES.VOLUNTEER.CALENDAR,
              queryVariables: { dateRange: [day.dateString] },
              rootRouteName: ROOT_ROUTE_NAMES.VOLUNTEER
            }
          })
        }
        displayLoadingIndicator={false} // TODO: set a loading state once queries are implemented
        markedDates={getMarkedDates()}
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
