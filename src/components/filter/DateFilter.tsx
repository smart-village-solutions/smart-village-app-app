import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import Collapsible from 'react-native-collapsible';

import { Icon, colors, consts, device, normalize, texts } from '../../config';
import { momentFormat, updateFilters } from '../../helpers';
import { DatesTypes, FilterProps } from '../../types';
import { Label } from '../Label';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';
import { renderArrow } from '../calendarArrows';

const {
  CALENDAR: { DOT_SIZE }
} = consts;

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  data: DatesTypes[];
  filters: FilterProps;
  setFilters: React.Dispatch<FilterProps>;
};

/* eslint-disable complexity */
const CalendarView = ({
  date,
  dates,
  data,
  isCollapsed,
  name,
  setDate
}: {
  date: string;
  dates: FilterProps;
  data: DatesTypes[];
  isCollapsed: boolean;
  name?: string;
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

  const selectedDateData = data.find((item) => item.name === name);
  const hasFutureDates = selectedDateData?.hasFutureDates ?? false;
  const hasPastDates = selectedDateData?.hasPastDates ?? false;

  let minDate: string | undefined;
  let maxDate: string | undefined;

  if (name === 'start_date') {
    if (!hasPastDates) {
      minDate = new Date().toDateString();
    }

    if (dates.end_date) {
      maxDate = momentFormat(dates.end_date, 'YYYY-MM-DD');
    } else if (!hasFutureDates) {
      maxDate = new Date().toDateString();
    }
  } else if (name === 'end_date') {
    if (dates.start_date) {
      minDate = momentFormat(dates.start_date, 'YYYY-MM-DD');
    } else if (!hasPastDates) {
      minDate = new Date().toDateString();
    }

    if (!hasFutureDates) {
      maxDate = new Date().toDateString();
    }
  }

  return (
    <Collapsible collapsed={isCollapsed}>
      <Calendar
        renderArrow={renderArrow}
        firstDay={1}
        minDate={minDate}
        maxDate={maxDate}
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
/* eslint-enable complexity */

export const DateFilter = ({ containerStyle, data, filters, setFilters }: Props) => {
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
          date={selectedDate[item.name] || momentFormat(filters?.[item.name], 'YYYY-MM-DD')}
          dates={filters}
          data={data}
          isCollapsed={isCollapsed[item.name]}
          key={`calendar-${item.name}`}
          name={item.name}
          setDate={(date: string) => {
            setIsCollapsed((prev) => ({ ...prev, [item.name]: true }));
            setSelectedDate((prev) => ({ ...prev, [item.name]: date }));
          }}
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
