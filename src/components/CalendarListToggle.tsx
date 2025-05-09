import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, Icon, normalize, texts } from '../config';

import { RegularText } from './Text';
import { WrapperRow } from './Wrapper';

type TCalendarListToggle = {
  showCalendar: boolean;
  setShowCalendar: (showCalendar: boolean) => void;
};

export const CalendarListToggle = ({ showCalendar, setShowCalendar }: TCalendarListToggle) => (
  <WrapperRow style={styles.paddingLeft}>
    <TouchableOpacity onPress={() => setShowCalendar(false)}>
      <WrapperRow style={[styles.calendarListToggle, !showCalendar && styles.underline]}>
        <Icon.List color={colors.darkText} size={normalize(12)} style={styles.icon} />
        <RegularText>{texts.calendarToggle.list}</RegularText>
      </WrapperRow>
    </TouchableOpacity>
    <TouchableOpacity onPress={() => setShowCalendar(true)}>
      <WrapperRow style={[styles.calendarListToggle, showCalendar && styles.underline]}>
        <Icon.CalendarToggle color={colors.darkText} size={normalize(12)} style={styles.icon} />
        <RegularText>{texts.calendarToggle.calendar}</RegularText>
      </WrapperRow>
    </TouchableOpacity>
  </WrapperRow>
);

const styles = StyleSheet.create({
  calendarListToggle: {
    alignItems: 'center',
    marginHorizontal: normalize(10),
    paddingVertical: normalize(5)
  },
  icon: {
    marginBottom: normalize(1),
    marginRight: normalize(6.5)
  },
  paddingLeft: {
    paddingLeft: normalize(6)
  },
  underline: {
    borderBottomWidth: normalize(1),
    borderColor: colors.darkText
  }
});
