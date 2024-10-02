import CommunityDateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps
} from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { Keyboard, Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, device, texts } from '../../config';
import { formatDate, formatTime } from '../../helpers';
import { Label } from '../Label';
import { BoldText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

import { Input } from './Input';
import { PickerInput } from './PickerInput';

type DateTimePickerProps = {
  value?: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: (IOSNativeProps | AndroidNativeProps)['mode'];
  onChange: (date?: Date) => void;
  dateTimePickerVisible: boolean;
  setDateTimePickerVisible: (newValue: boolean) => void;
};

const DateTimePicker = ({
  value = new Date(),
  maximumDate,
  minimumDate,
  mode,
  onChange,
  dateTimePickerVisible,
  setDateTimePickerVisible
}: DateTimePickerProps) => {
  const onDismissCallback = useCallback(() => {
    setDateTimePickerVisible(false);
  }, []);

  const onAcceptIOS = useCallback(() => {
    onChange(value);
    setDateTimePickerVisible(false);
  }, [value]);

  const onDatePickerChange = useCallback(
    (_, selectedDate?: Date) => {
      device.platform === 'android' && setDateTimePickerVisible(false);
      onChange(selectedDate);
    },
    [onChange]
  );

  if (!dateTimePickerVisible) return null;

  if (device.platform === 'android') {
    return (
      <CommunityDateTimePicker
        maximumDate={maximumDate}
        minimumDate={minimumDate}
        mode={mode}
        onChange={onDatePickerChange}
        textColor={colors.darkText}
        value={value}
      />
    );
  } else if (device.platform === 'ios') {
    return (
      <Modal
        animationType="none"
        transparent
        visible
        supportedOrientations={['landscape', 'portrait']}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <SafeAreaView>
              <WrapperRow spaceBetween>
                <TouchableOpacity onPress={onDismissCallback}>
                  <Wrapper style={styles.noPaddingBottom}>
                    <BoldText primary>{texts.dateTimePicker.cancel}</BoldText>
                  </Wrapper>
                </TouchableOpacity>
                <TouchableOpacity onPress={onAcceptIOS}>
                  <Wrapper style={styles.noPaddingBottom}>
                    <BoldText primary>{texts.dateTimePicker.ok}</BoldText>
                  </Wrapper>
                </TouchableOpacity>
              </WrapperRow>
              <Wrapper>
                <CommunityDateTimePicker
                  display="spinner"
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  mode={mode}
                  onChange={onDatePickerChange}
                  textColor={colors.darkText}
                  value={value}
                />
              </Wrapper>
            </SafeAreaView>
          </View>
        </View>
      </Modal>
    );
  }

  return null;
};

type DateTimeInputProps = {
  boldLabel?: boolean;
  control: any;
  errors: any;
  label: string;
  maximumDate?: Date;
  minimumDate?: Date;
  mode?: (IOSNativeProps | AndroidNativeProps)['mode'];
  name: string;
  onChange: () => void;
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
        {...{
          value,
          maximumDate,
          minimumDate,
          mode,
          onChange,
          dateTimePickerVisible,
          setDateTimePickerVisible
        }}
      />
    </>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: colors.overlayRgba,
    flex: 1,
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: colors.surface
  },
  noPaddingBottom: {
    paddingBottom: 0
  }
});
