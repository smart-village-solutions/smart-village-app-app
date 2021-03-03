import React from 'react';
import BasicDay from 'react-native-calendars/src/calendar/day/basic';

export const NoTouchDay = (props) => (
  <BasicDay {...props} marking={{ ...props.marking, disableTouchEvent: true }} />
);

NoTouchDay.propTypes = BasicDay.propTypes;
