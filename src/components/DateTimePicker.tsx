import CommunityDateTimePicker, {
  AndroidNativeProps,
  IOSNativeProps
} from '@react-native-community/datetimepicker';
import React, { useCallback, useState } from 'react';
import { useEffect } from 'react';
import { Modal, SafeAreaView, TouchableOpacity, View } from 'react-native';

import { consts, device, texts } from '../config';
import { useThemeStyles } from '../hooks/useThemeStyles';
import { useTheme } from '../hooks/useTheme';

import { BoldText } from './Text';
import { Wrapper, WrapperRow } from './Wrapper';

type Props = {
  initialTime?: Date;
  maximumDate?: Date;
  minimumDate?: Date;
  mode: (IOSNativeProps | AndroidNativeProps)['mode'];
  onUpdate: (date: Date) => void;
  setVisible: (newValue: boolean) => void;
  visible: boolean;
};

export const DateTimePicker = ({
  initialTime,
  maximumDate,
  minimumDate,
  mode,
  onUpdate,
  setVisible,
  visible
}: Props) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
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
          accessibilityViewIsModal
          supportedOrientations={['landscape', 'portrait']}
        >
          <View style={styles.modalContainer}>
            <View style={styles.dateTimePickerContainerIOS}>
              <SafeAreaView>
                <WrapperRow spaceBetween>
                  <TouchableOpacity
                    accessibilityLabel={`${texts.dateTimePicker.cancel} ${consts.a11yLabel.button}`}
                    accessibilityRole="button"
                    onPress={onDismissCallback}
                  >
                    <Wrapper style={styles.noPaddingBottom}>
                      <BoldText primary>{texts.dateTimePicker.cancel}</BoldText>
                    </Wrapper>
                  </TouchableOpacity>
                  <TouchableOpacity
                    accessibilityLabel={`${texts.dateTimePicker.ok} ${consts.a11yLabel.button}`}
                    accessibilityRole="button"
                    onPress={onAcceptIOS}
                  >
                    <Wrapper style={styles.noPaddingBottom}>
                      <BoldText primary>{texts.dateTimePicker.ok}</BoldText>
                    </Wrapper>
                  </TouchableOpacity>
                </WrapperRow>

                <CommunityDateTimePicker
                  display="spinner"
                  maximumDate={maximumDate}
                  minimumDate={minimumDate}
                  mode={mode}
                  onChange={onDatePickerChange}
                  style={styles.picker}
                  textColor={colors.darkText}
                  value={localSelectedTime || new Date()}
                />
              </SafeAreaView>
            </View>
          </View>
        </Modal>
      )}
      {device.platform === 'android' && visible && (
        <CommunityDateTimePicker
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          mode={mode}
          onChange={onDatePickerChange}
          value={localSelectedTime || new Date()}
        />
      )}
    </>
  );
};

const createStyles = (colors) => ({
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

  picker: {
    alignSelf: 'center'
  },

  radioContainer: {
    backgroundColor: colors.transparent
  }
});
