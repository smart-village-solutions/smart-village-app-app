import React from 'react';
import BasicDay, { BasicDayProps } from 'react-native-calendars/src/calendar/day/basic';

export const NoTouchDay = (props: BasicDayProps) => (
  <BasicDay {...props} marking={{ ...props.marking, disableTouchEvent: true }} />
);
