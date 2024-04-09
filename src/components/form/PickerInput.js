import PropTypes from 'prop-types';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, device, Icon, normalize } from '../../config';
import { RegularText } from '../Text';

export const PickerInput = ({ value, onPress, isPlaceholder, errorMessage }) => (
  <Pressable
    style={({ pressed }) => [
      styles.pickerInput,
      device.platform === 'ios' && pressed && styles.pickerInputPressed,
      value && !isPlaceholder && styles.pickerInputSuccess,
      !errorMessage && styles.pickerInputNoError,
      !!errorMessage && styles.pickerInputError
    ]}
    onPress={onPress}
    android_ripple={{ color: colors.gray40 }}
  >
    <RegularText style={styles.pickerText} placeholder={isPlaceholder} numberOfLines={1}>
      {value}
    </RegularText>
    <Pressable
      style={styles.icon}
      onPress={onPress}
      android_ripple={{
        color: colors.placeholder,
        radius: normalize(22),
        borderless: true
      }}
    >
      {errorMessage ? (
        <Icon.AlertHexagonFilled color={colors.error} size={normalize(16)} />
      ) : (
        <Icon.Calendar />
      )}
    </Pressable>
  </Pressable>
);

const styles = StyleSheet.create({
  pickerInput: {
    alignItems: 'center',
    borderBottomWidth: normalize(1),
    borderColor: colors.gray40,
    borderRadius: normalize(8),
    borderLeftWidth: normalize(1),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1),
    flexDirection: 'row',
    height: normalize(42),
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12)
  },
  pickerInputSuccess: {
    borderColor: colors.gray40
  },
  pickerInputNoError: {
    marginBottom: normalize(8)
  },
  pickerInputError: {
    borderColor: colors.error
  },
  pickerText: {},
  pickerInputPressed: {
    // like TouchableOpacity: https://reactnative.dev/docs/next/touchableopacity#activeopacity
    opacity: 0.2
  },
  icon: {}
});

PickerInput.propTypes = {
  value: PropTypes.string,
  onPress: PropTypes.func,
  isPlaceholder: PropTypes.bool,
  errorMessage: PropTypes.string
};

PickerInput.defaultProps = {
  isPlaceholder: false
};
