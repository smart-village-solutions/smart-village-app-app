import React, { useState } from 'react';
import { Keyboard } from 'react-native';
import {
  AndroidNativeProps,
  IOSNativeProps
} from '@react-native-community/datetimepicker';

import { consts } from '../../config';
import { formatDate, formatTime } from '../../helpers';
import { DateTimePicker } from '../DateTimePicker';
import { Label } from '../Label';

import { Input } from './Input';
import { PickerInput } from './PickerInput';

type DateTimeInputProps = {
  boldLabel?: boolean;
  control: any;
  errors: any;
  label: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: (IOSNativeProps | AndroidNativeProps)['mode'];
  name: string;
  onChange: (date: Date) => void;
  placeholder: string;
  required?: boolean;
  rules?: any;
  value?: string;
};

export const DateTimeInput = ({
  boldLabel = false,
  control,
  errors,
  label,
  maximumDate,
  minimumDate,
  mode = 'time',
  name,
  onChange,
  placeholder,
  required = false,
  rules = {},
  value
}: DateTimeInputProps) => {
  const [dateTimePickerVisible, setDateTimePickerVisible] = useState(false);
  const format = mode === 'date' ? formatDate : formatTime;
  const pickerInput =
    (!!value && format(typeof value === 'string' ? new Date(value) : value)) || placeholder;

  return (
    <>
      <Label bold={boldLabel}>{label}</Label>
      <PickerInput
        accessibilityHint={consts.a11yLabel.birthDateHint}
        accessibilityLabel={`${label} ${consts.a11yLabel.dropDownMenu}`}
        expanded={dateTimePickerVisible}
        value={pickerInput}
        onPress={() => {
          setDateTimePickerVisible(true);
          Keyboard.dismiss();
        }}
        isPlaceholder={!value}
        errorMessage={errors[name] && `${label} muss ausgewählt werden`}
      />
      <Input
        name={name}
        hidden
        validate
        rules={{ required, ...rules }}
        errorMessage={errors[name] && (errors[name]?.message || `${label} muss ausgewählt werden`)}
        control={control}
      />
      <DateTimePicker
        initialTime={value ? new Date(value) : undefined}
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        mode={mode}
        onUpdate={onChange}
        setVisible={setDateTimePickerVisible}
        visible={dateTimePickerVisible}
      />
    </>
  );
};

