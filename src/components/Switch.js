import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { Platform, Pressable, StyleSheet, Switch as RNSwitch, View } from 'react-native';
import Animated from 'react-native-reanimated';

import { AccessibilityContext } from '../AccessibilityProvider';
import { device, normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

const NativeSwitch = ({
  accessibilityLabel,
  colors,
  isDisabled,
  isReduceTransparencyEnabled,
  switchValue,
  toggleSwitch
}) => {
  const trackColor = Platform.select({
    android: { false: colors.gray60, true: colors.primary },
    ios: { false: colors.gray60, true: colors.primary }
  });
  const thumbColor = Platform.select({ android: colors.gray20, ios: colors.onPrimary });
  const disabledThumbColor = Platform.select({ android: colors.gray40, ios: colors.onPrimary });

  return (
    <View style={isDisabled && styles.disabled}>
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

NativeSwitch.propTypes = {
  accessibilityLabel: PropTypes.string,
  colors: PropTypes.object.isRequired,
  isDisabled: PropTypes.bool,
  isReduceTransparencyEnabled: PropTypes.bool,
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};

const IOSStateIndicator = ({ colors, switchValue }) => {
  const indicatorPositionStyle = switchValue
    ? styles.iosStateIndicatorOn
    : styles.iosStateIndicatorOff;
  const indicatorStyle = switchValue
    ? [styles.iosOnIndicator, { backgroundColor: colors.onPrimary }]
    : [styles.iosOffIndicator, { borderColor: colors.text }];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.iosStateIndicator, indicatorPositionStyle]}
      testID={switchValue ? 'switch-state-on' : 'switch-state-off'}
    >
      <View style={indicatorStyle} testID={switchValue ? 'switch-on-line' : 'switch-off-circle'} />
    </View>
  );
};

IOSStateIndicator.propTypes = {
  colors: PropTypes.object.isRequired,
  switchValue: PropTypes.bool.isRequired
};

const AppControlledIOSSwitch = ({
  accessibilityLabel,
  colors,
  isDisabled,
  isReduceMotionEnabled,
  isReduceTransparencyEnabled,
  isSwitchLabelsEnabled,
  switchValue,
  toggleSwitch
}) => {
  const animationDuration = isReduceMotionEnabled ? 0 : 180;
  const trackStyle = {
    backgroundColor: switchValue ? colors.primary : colors.gray60,
    borderColor: !switchValue && isReduceTransparencyEnabled ? colors.border : colors.transparent,
    transitionDuration: animationDuration,
    transitionProperty: ['backgroundColor', 'borderColor'],
    transitionTimingFunction: 'ease-out'
  };
  const thumbStyle = {
    backgroundColor: isDisabled ? colors.gray40 : colors.onPrimary,
    transform: [{ translateX: switchValue ? normalize(15) : 0 }],
    transitionDuration: animationDuration,
    transitionProperty: 'transform',
    transitionTimingFunction: 'ease-out'
  };

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="switch"
      accessibilityState={{ checked: switchValue, disabled: isDisabled }}
      disabled={isDisabled}
      hitSlop={normalize(8)}
      onPress={() => toggleSwitch(!switchValue)}
      style={[styles.iosControl, isDisabled && styles.disabled]}
    >
      <Animated.View style={[styles.iosTrack, trackStyle]}>
        {isSwitchLabelsEnabled && <IOSStateIndicator colors={colors} switchValue={switchValue} />}
        <Animated.View pointerEvents="none" style={[styles.iosThumb, thumbStyle]} />
      </Animated.View>
    </Pressable>
  );
};

AppControlledIOSSwitch.propTypes = {
  accessibilityLabel: PropTypes.string,
  colors: PropTypes.object.isRequired,
  isDisabled: PropTypes.bool,
  isReduceMotionEnabled: PropTypes.bool,
  isReduceTransparencyEnabled: PropTypes.bool,
  isSwitchLabelsEnabled: PropTypes.bool,
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};

export const Switch = ({
  accessibilityLabel,
  isDisabled,
  showSwitchLabels,
  switchValue,
  toggleSwitch
}) => {
  const accessibility = useContext(AccessibilityContext);
  const { colors } = useTheme();

  if (
    Platform.OS === 'ios' &&
    (accessibility.features?.switchLabels === true || showSwitchLabels)
  ) {
    return (
      <AppControlledIOSSwitch
        accessibilityLabel={accessibilityLabel}
        colors={colors}
        isDisabled={isDisabled}
        isReduceMotionEnabled={accessibility.isReduceMotionEnabled}
        isReduceTransparencyEnabled={accessibility.isReduceTransparencyEnabled}
        isSwitchLabelsEnabled={showSwitchLabels || accessibility.isSwitchLabelsEnabled}
        switchValue={switchValue}
        toggleSwitch={toggleSwitch}
      />
    );
  }

  return (
    <NativeSwitch
      accessibilityLabel={accessibilityLabel}
      colors={colors}
      isDisabled={isDisabled}
      isReduceTransparencyEnabled={accessibility.isReduceTransparencyEnabled}
      switchValue={switchValue}
      toggleSwitch={toggleSwitch}
    />
  );
};

/* Dynamic theme styles cannot be resolved by react-native/no-unused-styles. */
/* eslint-disable react-native/no-unused-styles */
const styles = StyleSheet.create({
  disabled: {
    opacity: 0.65
  },
  iosControl: {
    alignItems: 'center',
    height: normalize(32),
    justifyContent: 'center',
    width: normalize(47)
  },
  iosOffIndicator: {
    borderRadius: normalize(4),
    borderWidth: normalize(1.5),
    height: normalize(8),
    width: normalize(8)
  },
  iosOnIndicator: {
    borderRadius: normalize(1),
    height: normalize(10),
    width: normalize(2)
  },
  iosStateIndicator: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: normalize(17)
  },
  iosStateIndicatorOff: {
    right: 0
  },
  iosStateIndicatorOn: {
    left: 0
  },
  iosSwitch: {
    right: -6,
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }]
  },
  iosThumb: {
    borderRadius: normalize(10),
    height: normalize(20),
    left: normalize(2),
    position: 'absolute',
    top: normalize(2),
    width: normalize(20)
  },
  iosTrack: {
    borderRadius: normalize(12),
    borderWidth: StyleSheet.hairlineWidth,
    height: normalize(24),
    overflow: 'hidden',
    position: 'relative',
    width: normalize(39)
  }
});
/* eslint-enable react-native/no-unused-styles */

Switch.propTypes = {
  accessibilityLabel: PropTypes.string,
  isDisabled: PropTypes.bool,
  showSwitchLabels: PropTypes.bool,
  switchValue: PropTypes.bool.isRequired,
  toggleSwitch: PropTypes.func.isRequired
};

Switch.defaultProps = {
  isDisabled: false,
  showSwitchLabels: false
};
