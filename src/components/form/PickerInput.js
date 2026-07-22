import PropTypes from 'prop-types';
import React from 'react';
import { Pressable, View } from 'react-native';

import { device, Icon, normalize } from '../../config';
import { RegularText } from '../Text';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

export const PickerInput = ({
  accessibilityHint,
  accessibilityLabel,
  errorMessage,
  expanded = false,
  isPlaceholder = false,
  onPress,
  value
}) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);

  return (
    <Pressable
      accessibilityHint={accessibilityHint}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      accessible
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
      {/* Icon is non-interactive; pointer events are disabled so the outer
          Pressable handles the full tap area, avoiding nested touchables. */}
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={styles.icon}
      >
        {errorMessage ? (
          <Icon.AlertHexagonFilled color={colors.error} size={normalize(16)} />
        ) : (
          <Icon.Calendar />
        )}
      </View>
    </Pressable>
  );
};

const createStyles = (colors) => ({
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
  accessibilityHint: PropTypes.string,
  accessibilityLabel: PropTypes.string,
  errorMessage: PropTypes.string,
  expanded: PropTypes.bool,
  isPlaceholder: PropTypes.bool,
  onPress: PropTypes.func,
  value: PropTypes.string
};
