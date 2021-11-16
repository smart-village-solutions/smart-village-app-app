import CommunityDateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps
} from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { Modal, SafeAreaView, StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, device, texts } from '../config';

import { BoldText } from './Text';
import { Wrapper, WrapperRow } from './Wrapper';

type Props = {
  initialTime?: Date;
  mode: (IOSNativeProps | AndroidNativeProps)['mode'];
  onUpdate: (date: Date) => void;
  setVisible: (newValue: boolean) => void;
  visible: boolean;
};

export const DateTimePicker = ({ initialTime, mode, onUpdate, setVisible, visible }: Props) => {
  const [localSelectedTime, setLocalSelectedTime] = useState<Date>(initialTime ?? new Date());

  const onDismissCallback = useCallback(() => {
    setVisible(false);
  }, [localSelectedTime, onUpdate]);

  const onAcceptIOS = useCallback(() => {
    onUpdate(localSelectedTime);
    setVisible(false);
  }, [localSelectedTime, onUpdate]);

  const onDatePickerChange = useCallback(
    (_, newTime?: Date) => {
      if (device.platform === 'android') {
        if (newTime) {
          newTime.setMilliseconds(0);
          newTime.setSeconds(0);
          onUpdate(newTime);
        }
        setVisible(false);
      }

      setLocalSelectedTime((time) => newTime || time);
    },
    [setLocalSelectedTime]
  );

  useEffect(() => {
    if (initialTime) setLocalSelectedTime(initialTime);
  }, [initialTime]);

  return (
    <>
      {device.platform === 'ios' && (
        <Modal
          animationType="none"
          transparent={true}
          visible={visible}
          supportedOrientations={['landscape', 'portrait']}
        >
          <View style={styles.modalContainer}>
            <View style={styles.dateTimePickerContainerIOS}>
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

                <CommunityDateTimePicker
                  display="spinner"
                  textColor={colors.darkText}
                  mode={mode}
                  onChange={onDatePickerChange}
                  value={localSelectedTime || new Date()}
                />
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}
      {device.platform === 'android' && visible && (
        <CommunityDateTimePicker
          mode={mode}
          onChange={onDatePickerChange}
          value={localSelectedTime || new Date()}
        />
      )}
    </>
  );
};

const styles = StyleSheet.create({
  dateTimePickerContainerIOS: {
    backgroundColor: colors.surface
  },
  modalContainer: {
    backgroundColor: colors.overlayRgba,
    flex: 1,
    justifyContent: 'flex-end'
  },
  noPaddingBottom: {
    paddingBottom: 0
  },
  radioContainer: {
    backgroundColor: colors.transparent
  }
});
