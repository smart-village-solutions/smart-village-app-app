import React, { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react';
import { Controller } from 'react-hook-form';
import { StyleProp, StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import { Calendar, CalendarProps } from 'react-native-calendars';
import Collapsible from 'react-native-collapsible';

import { Icon, colors, consts, device, normalize, texts } from '../../config';
import { momentFormat } from '../../helpers';
import { Label } from '../Label';
import { RegularText } from '../Text';
import { WrapperRow } from '../Wrapper';
import { renderArrow } from '../calendarArrows';

import { Input } from './../form';

const {
  CALENDAR: { DOT_SIZE }
} = consts;

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
  control: any;
  errors: any;
  required?: boolean;
  data: { name: string; placeholder: string }[];
};

const CalendarView = ({
  date,
  setDate,
  isCollapsed
}: {
  date: string;
  setDate: Dispatch<SetStateAction<string>>;
  isCollapsed: boolean;
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
        maxDate={new Date().toDateString()}
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

export const DateFilter = ({ containerStyle, control, errors, required, data }: Props) => {
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
      <Label>{texts.filter.date}</Label>
      <WrapperRow spaceBetween>
        {data.map((item) => (
          <View key={item.name} style={(styles.container, containerStyle)}>
            <Controller
              name={item.name}
              render={({ field: { name, onChange, value } }) => {
                useEffect(() => {
                  onChange(selectedDate[item.name]);
                }, [selectedDate[item.name]]);

                return (
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
                      <RegularText style={styles.buttonText} placeholder={!value}>
                        {value ? momentFormat(value, 'DD.MM.YYYY') : item.placeholder}
                      </RegularText>

                      <Icon.Calendar style={styles.icon} />
                    </TouchableOpacity>
                    <Input
                      name={item.name}
                      validate
                      hidden
                      rules={{ required }}
                      errorMessage={errors[name] && `${name} muss ausgewählt werden`}
                      control={control}
                    />
                  </>
                );
              }}
              control={control}
            />
          </View>
        ))}
      </WrapperRow>

      {data.map((item) => (
        <CalendarView
          key={`calendar-${item.name}`}
          date={selectedDate[item.name]}
          setDate={(date) => setSelectedDate((prev) => ({ ...prev, [item.name]: date }))}
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
