import React from 'react';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';
import { DateData } from 'react-native-calendars/src/types';

export const DayComponent = (props: BasicDayProps & { date?: DateData }) => (
  <BasicDay
    {...props}
    date={props?.date?.dateString}
    marking={{ ...props.marking, disableTouchEvent: !props.marking?.marked }}
  />
);
