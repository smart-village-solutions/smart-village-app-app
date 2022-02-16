import { DrawerNavigationProp } from '@react-navigation/drawer';
import moment from 'moment';
import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Calendar } from 'react-native-calendars';

import { NoTouchDay, renderArrow } from '..';
import { colors, normalize } from '../../config';
import { setupLocales } from '../../helpers';
import { myCalendar } from '../../helpers/parser/volunteer';

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
        dayComponent={NoTouchDay}
        markedDates={getMarkedDates()}
        markingType="multi-dot"
        renderArrow={renderArrow}
        theme={{
          todayTextColor: colors.primary,
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
