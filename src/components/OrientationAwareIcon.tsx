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
  const isNamedIcon = SelectedIcon === IconComponent.NamedIcon;

  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  const getIconProps = () => {
    const baseProps = {
      ...props,
      ...(isNamedIcon ? { name: iconName } : {})
    };

    if (device.platform === 'android' || !needLandscapeStyle) {
      return baseProps;
    }

    const adjustedSize = size * LANDSCAPE_ADJUSTMENT_FACTOR;

    return {
      ...baseProps,
      iconStyle: [iconStyle, styles.marginIcon, { width: adjustedSize }, landscapeIconStyle],
      size: adjustedSize,
      style: [style, landscapeStyle]
    };
  };

  return <SelectedIcon {...getIconProps()} />;
};

const styles = StyleSheet.create({
  marginIcon: {
    marginRight: normalize(10)
  }
});
