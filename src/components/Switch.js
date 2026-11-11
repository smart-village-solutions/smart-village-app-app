import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import {
  Platform,
  Pressable,
  StyleSheet,
  Switch as RNSwitch,
  useWindowDimensions,
  View
} from 'react-native';
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

const SwitchStateIndicator = ({ colors, switchValue }) => {
  const indicatorPositionStyle = switchValue ? styles.stateIndicatorOn : styles.stateIndicatorOff;
  const indicatorStyle = switchValue
    ? [styles.onIndicator, { backgroundColor: colors.onPrimary }]
    : [styles.offIndicator, { borderColor: colors.surface }];

  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[styles.stateIndicator, indicatorPositionStyle]}
      testID={switchValue ? 'switch-state-on' : 'switch-state-off'}
    >
      <View style={indicatorStyle} testID={switchValue ? 'switch-on-line' : 'switch-off-circle'} />
    </View>
  );
};

SwitchStateIndicator.propTypes = {
  colors: PropTypes.object.isRequired,
  switchValue: PropTypes.bool.isRequired
};

const AppControlledSwitch = ({
  accessibilityLabel,
  colors,
  isDisabled,
  isReduceMotionEnabled,
  isReduceTransparencyEnabled,
  isSwitchLabelsEnabled,
  switchValue,
  toggleSwitch
}) => {
  // Refresh track and thumb dimensions together when a tablet or desktop window changes size.
  useWindowDimensions();
  const trackWidth = normalize(39);
  const trackHeight = normalize(24);
  const thumbSize = normalize(20);
  const thumbGap = (trackHeight - thumbSize) / 2;
  // Absolute child offsets start inside the track's border, including a transparent border.
  const borderWidth = StyleSheet.hairlineWidth;
  const thumbInset = thumbGap - borderWidth;
  const controlStyle = { height: normalize(32), width: normalize(47) };
  const animationDuration = isReduceMotionEnabled ? 0 : 180;
  const trackStyle = {
    borderWidth,
    borderRadius: trackHeight / 2,
    height: trackHeight,
    width: trackWidth,
    backgroundColor: switchValue ? colors.primary : colors.gray60,
    borderColor: !switchValue && isReduceTransparencyEnabled ? colors.border : colors.transparent,
    transitionDuration: animationDuration,
    transitionProperty: ['backgroundColor', 'borderColor'],
    transitionTimingFunction: 'ease-out'
  };
  const thumbStyle = {
    borderRadius: thumbSize / 2,
    height: thumbSize,
    left: thumbInset,
    top: thumbInset,
    width: thumbSize,
    backgroundColor: isDisabled ? colors.gray40 : colors.onPrimary,
    transform: [{ translateX: switchValue ? trackWidth - thumbSize - 2 * thumbGap : 0 }],
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
      style={[styles.appControlledSwitch, controlStyle, isDisabled && styles.disabled]}
    >
      <Animated.View style={[styles.appControlledTrack, trackStyle]} testID="switch-track">
        {isSwitchLabelsEnabled && (
          <SwitchStateIndicator colors={colors} switchValue={switchValue} />
        )}
        <Animated.View
          pointerEvents="none"
          style={[styles.appControlledThumb, thumbStyle]}
          testID="switch-thumb"
        />
      </Animated.View>
    </Pressable>
  );
};

AppControlledSwitch.propTypes = {
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

  if (accessibility.features?.switchLabels === true || showSwitchLabels) {
    return (
      <AppControlledSwitch
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
  appControlledSwitch: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  appControlledThumb: {
    position: 'absolute'
  },
  appControlledTrack: {
    overflow: 'hidden',
    position: 'relative'
  },
  disabled: {
    opacity: 0.65
  },
  offIndicator: {
    borderRadius: normalize(4),
    borderWidth: normalize(1.5),
    height: normalize(8),
    width: normalize(8)
  },
  onIndicator: {
    borderRadius: normalize(1),
    height: normalize(10),
    width: normalize(2)
  },
  stateIndicator: {
    alignItems: 'center',
    bottom: 0,
    justifyContent: 'center',
    position: 'absolute',
    top: 0,
    width: normalize(17)
  },
  stateIndicatorOff: {
    right: 0
  },
  stateIndicatorOn: {
    left: 0
  },
  iosSwitch: {
    right: -6,
    transform: [{ scaleX: 0.75 }, { scaleY: 0.75 }]
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
