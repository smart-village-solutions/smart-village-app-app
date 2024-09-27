import PropTypes from 'prop-types';
import React from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { colors, device, Icon, normalize } from '../../config';
import { RegularText } from '../Text';

export const PickerInput = ({ isPlaceholder = false, onPress, value }) => (
  <Pressable
    style={({ pressed }) => [
      styles.pickerInput,
      device.platform === 'ios' && pressed && styles.pickerInputPressed,
      value && !isPlaceholder && styles.pickerInputSuccess
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
      {value && !isPlaceholder ? <Icon.Ok color={colors.primary} /> : <Icon.ArrowDown />}
    </Pressable>
  </Pressable>
);

const styles = StyleSheet.create({
  pickerInput: {
    alignItems: 'center',
    borderBottomWidth: normalize(1),
    borderColor: colors.gray40,
    borderLeftWidth: normalize(1),
    borderRightWidth: normalize(1),
    borderTopWidth: normalize(1),
    flexDirection: 'row',
    height: normalize(50),
    justifyContent: 'space-between',
    paddingHorizontal: normalize(12)
  },
  pickerInputSuccess: {
    borderColor: colors.primary
  },
  pickerText: {
    marginTop: normalize(4)
  },
  pickerInputPressed: {
    // like TouchableOpacity: https://reactnative.dev/docs/next/touchableopacity#activeopacity
    opacity: 0.2
  },
  icon: {}
});

PickerInput.propTypes = {
  isPlaceholder: PropTypes.bool,
  onPress: PropTypes.func,
  value: PropTypes.string
};
