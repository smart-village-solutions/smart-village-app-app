import React, { useContext } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { consts, device, Icon as IconComponent, IconProps, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

type Props = IconProps & {
  Icon: (props: IconProps) => JSX.Element;
  iconName: keyof typeof IconComponent;
  landscapeIconStyle?: StyleProp<ViewStyle>;
  landscapeStyle?: StyleProp<ViewStyle>;
  size?: number;
};

const LANDSCAPE_ADJUSTMENT_FACTOR = 0.75;

export const OrientationAwareIcon = (props: Props) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const {
    Icon,
    iconName,
    iconStyle,
    landscapeIconStyle,
    landscapeStyle,
    size = normalize(24),
    style
  } = props;

  const SelectedIcon = Icon || IconComponent.NamedIcon;

  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  // we need adjustments only on iOS, so otherwise just return the item with the usual props
  // TODO: is this still needed with Expo 48?
  if (!needLandscapeStyle || !(device.platform === 'ios')) {
    if (SelectedIcon === IconComponent.NamedIcon) {
      return <SelectedIcon {...props} name={iconName} />;
    }

    return <SelectedIcon {...props} />;
  }

  const adjustedSize = size * LANDSCAPE_ADJUSTMENT_FACTOR;

  if (SelectedIcon === IconComponent.NamedIcon) {
    return (
      <SelectedIcon
        {...props}
        name={iconName}
        iconStyle={[iconStyle, styles.marginIcon, { width: adjustedSize }, landscapeIconStyle]}
        size={adjustedSize}
        style={[style, landscapeStyle]}
      />
    );
  }

  return (
    <SelectedIcon
      {...props}
      iconStyle={[iconStyle, styles.marginIcon, { width: adjustedSize }, landscapeIconStyle]}
      size={adjustedSize}
      style={[style, landscapeStyle]}
    />
  );
};

const styles = StyleSheet.create({
  marginIcon: {
    marginRight: normalize(10)
  }
});
