import PropTypes from 'prop-types';
import React, { useContext, useMemo } from 'react';
import { Platform, StyleSheet, Switch as RNSwitch, View } from 'react-native';

import { AccessibilityContext } from '../AccessibilityProvider';
import { device, Icon, normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

export const Switch = ({ accessibilityLabel, isDisabled, switchValue, toggleSwitch }) => {
  const { isReduceTransparencyEnabled } = useContext(AccessibilityContext);
  const { colors } = useTheme();
  const styles = useMemo(() => createStyles(colors), [colors]);
  const trackColor = Platform.select({
    android: { false: colors.gray60, true: colors.primary },
    ios: { false: colors.gray60, true: colors.primary }
  });
  const thumbColor = Platform.select({ android: colors.gray20, ios: colors.onPrimary });
  const disabledThumbColor = Platform.select({ android: colors.gray40, ios: colors.onPrimary });

  return (
    <View style={[styles.container, isDisabled && styles.disabled]}>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        pointerEvents="none"
        style={styles.stateIcon}
        testID={switchValue ? 'switch-state-on' : 'switch-state-off'}
      >
        <Icon.NamedIcon
          color={colors.text}
          hasNoHitSlop
          name={switchValue ? 'check' : 'x'}
          size={normalize(18)}
          strokeWidth={2.5}
        />
      </View>

      <RNSwitch
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="switch"
        accessibilityState={{ checked: switchValue, disabled: isDisabled }}
        disabled={isDisabled}
        ios_backgroundColor={
          isDisabled ? colors.gray40 : isReduceTransparencyEnabled ? colors.border : colors.gray60
        }
        onValueChange={toggleSwitch}
        style={[device.platform === 'ios' && !device.isTablet && styles.iosSwitch]}
        thumbColor={isDisabled ? disabledThumbColor : thumbColor}
        trackColor={trackColor}
        value={switchValue}
      />
    </View>
  );
};

/* Dynamic theme styles cannot be resolved by react-native/no-unused-styles. */
/* eslint-disable react-native/no-unused-styles */
const createStyles = (colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      flexDirection: 'row'
    },
    disabled: {
      opacity: 0.65
    },
    iosSwitch: {
      right: -6,
      transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }]
    },
    stateIcon: {
      alignItems: 'center',
      borderColor: colors.border,
      borderRadius: normalize(12),
      borderWidth: StyleSheet.hairlineWidth,
      height: normalize(24),
      justifyContent: 'center',
      marginRight: device.platform === 'ios' && !device.isTablet ? 0 : normalize(6),
      width: normalize(24)
    }
  });
/* eslint-enable react-native/no-unused-styles */

Switch.propTypes = {
  accessibilityLabel: PropTypes.string,
  isDisabled: PropTypes.bool,
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};
