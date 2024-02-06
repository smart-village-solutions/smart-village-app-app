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
  item: {
    type: string;
    startDate: { name: string; placeholder: string };
    endDate: { name: string; placeholder: string };
  };
};

export const DateFilter = ({ containerStyle, control, errors, required, item }: Props) => {
  const [isStartDateCollapsed, setIsStartDateCollapsed] = useState(false);
  const [isEndDateCollapsed, setIsEndDateCollapsed] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const {
    startDate: { name: startDateName, placeholder: startDatePlaceholder },
    endDate: { name: endDateName, placeholder: endDatePlaceholder }
  } = item;

  return (
    <>
      <Label>{texts.filter.date}</Label>
      <WrapperRow spaceBetween>
        <View style={(styles.container, containerStyle)}>
          <Controller
            name={startDateName}
            render={({ field: { name, onChange, value } }) => {
              useEffect(() => {
                onChange(startDate);
              }, [startDate]);

              return (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setIsStartDateCollapsed(!isStartDateCollapsed);
                      setIsEndDateCollapsed(false);
                    }}
                  >
                    <RegularText style={styles.buttonText} placeholder={!value}>
                      {value ? value : startDatePlaceholder}
                    </RegularText>

                    <Icon.Calendar style={styles.icon} />
                  </TouchableOpacity>
                  <Input
                    name={startDateName}
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

        <View style={(styles.container, containerStyle)}>
          <Controller
            name={endDateName}
            render={({ field: { name, onChange, value } }) => {
              useEffect(() => {
                onChange(endDate);
              }, [endDate]);

              return (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      setIsEndDateCollapsed(!isEndDateCollapsed);
                      setIsStartDateCollapsed(false);
                    }}
                  >
                    <RegularText style={styles.buttonText} placeholder={!value}>
                      {value ? value : endDatePlaceholder}
                    </RegularText>

                    <Icon.Calendar style={styles.icon} />
                  </TouchableOpacity>
                  <Input
                    name={endDateName}
                    hidden
                    validate
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
      </WrapperRow>

      <CalendarView date={startDate} setDate={setStartDate} isCollapsed={isStartDateCollapsed} />

      <CalendarView date={endDate} setDate={setEndDate} isCollapsed={isEndDateCollapsed} />
    </>
  );
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
    <Collapsible collapsed={!isCollapsed}>
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
