import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import Collapsible from 'react-native-collapsible';

import { Icon, colors, consts, device, normalize, texts } from '../../config';
import { momentFormat, updateFilters } from '../../helpers';
import { FilterProps } from '../../types';
import { Label } from '../Label';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';
import { renderArrow } from '../calendarArrows';

const {
  CALENDAR: { DOT_SIZE }
} = consts;

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: { name: keyof FilterProps; placeholder: string }[];
  filters: FilterProps;
  hasFutureDates?: boolean;
  hasPastDates?: boolean;
  setFilters: React.Dispatch<FilterProps>;
};

const CalendarView = ({
  date,
  hasFutureDates = false,
  hasPastDates = false,
  isCollapsed,
  setDate
}: {
  date: string;
  hasFutureDates?: boolean;
  hasPastDates?: boolean;
  isCollapsed: boolean;
  setDate: Dispatch<SetStateAction<string>>;
}) => {
  const markedDates = useMemo(() => {
    const dates: CalendarProps['markedDates'] = {};

    // highlight selected day
    dates[date] = {
      ...(dates[date] ?? {}),
      selected: true,
      selectedColor: colors.lighterPrimary
    };

    return dates;
  }, [date]);

  return (
    <Collapsible collapsed={isCollapsed}>
      <Calendar
        renderArrow={renderArrow}
        firstDay={1}
        minDate={hasFutureDates ? new Date().toDateString() : undefined}
        maxDate={hasPastDates ? new Date().toDateString() : undefined}
        onDayPress={(date: { dateString: string }) =>
          setDate(momentFormat(date.dateString, 'YYYY-MM-DD'))
        }
        markedDates={markedDates}
        markingType="dot"
        theme={{
          todayTextColor: colors.primary,
          indicatorColor: colors.primary,
          dotStyle: {
            borderRadius: DOT_SIZE / 2,
            height: DOT_SIZE,
            width: DOT_SIZE
          }
        }}
      />
    </Collapsible>
  );
};

export const DateFilter = ({
  containerStyle,
  data,
  filters,
  hasFutureDates,
  hasPastDates,
  setFilters
}: Props) => {
  const [isCollapsed, setIsCollapsed] = useState<{ [key: string]: boolean }>(
    data.reduce((acc: { [key: string]: boolean }, item) => {
      acc[item.name] = true;
      return acc;
    }, {})
  );
  const [selectedDate, setSelectedDate] = useState<{ [key: string]: string }>(
    data.reduce((acc: { [key: string]: string }, item) => {
      acc[item.name] = '';
      return acc;
    }, {})
  );

  if (!data.length) return null;

  return (
    <>
      <Label bold>{texts.filter.date}</Label>
      <WrapperRow spaceBetween>
        {data.map((item) => {
          useEffect(() => {
            const endTimeOfDay = item.name === 'start_date' ? 'T00:00:00+01:00' : 'T22:59:59+01:00';

            setFilters(
              updateFilters({
                currentFilters: filters,
                name: item.name as keyof FilterProps,
                removeFromFilter: !selectedDate[item.name],
                value: `${selectedDate[item.name]}${endTimeOfDay}`
              })
            );
          }, [selectedDate[item.name]]);

          return (
            <View key={item.name} style={(styles.container, containerStyle)}>
              <>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setIsCollapsed((prev) =>
                      Object.keys(prev).reduce((acc: { [key: string]: boolean }, key) => {
                        acc[key] = key === item.name ? !prev[key] : true;
                        return acc;
                      }, {})
                    );
                  }}
                >
                  <RegularText
                    style={styles.buttonText}
                    placeholder={
                      !filters[item.name] || filters.start_date === filters.initial_start_date
                    }
                  >
                    {filters[item.name] && filters.start_date !== filters.initial_start_date
                      ? momentFormat(filters[item.name], 'DD.MM.YYYY')
                      : item.placeholder}
                  </RegularText>

                  <Icon.Calendar style={styles.icon} />
                </TouchableOpacity>
              </>
            </View>
          );
        })}
      </WrapperRow>

      {data.map((item) => (
        <CalendarView
          key={`calendar-${item.name}`}
          date={selectedDate[item.name]}
          hasFutureDates={hasFutureDates}
          hasPastDates={hasPastDates}
          setDate={(date: string) => {
            setIsCollapsed((prev) => ({ ...prev, [item.name]: true }));
            setSelectedDate((prev) => ({ ...prev, [item.name]: date }));
          }}
          isCollapsed={isCollapsed[item.name]}
        />
      ))}
    </>
  );
};

const styles = StyleSheet.create({
  container: {},
  button: {
    alignItems: 'center',
    borderBottomWidth: normalize(1),
    borderColor: colors.gray40,
    borderLeftWidth: normalize(1),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1),
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  buttonText: {
    paddingLeft: normalize(16),
    paddingVertical: device.platform === 'ios' ? normalize(10) : normalize(8),
    fontFamily: 'regular'
  },
  icon: {
    paddingRight: normalize(16)
  }
});
