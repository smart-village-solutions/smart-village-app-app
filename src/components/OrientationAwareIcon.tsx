import React, { useContext } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { device, IconProps, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

type Props = IconProps & {
  Icon: (props: IconProps) => JSX.Element;
  landscapeIconStyle?: StyleProp<ViewStyle>;
  landscapeStyle?: StyleProp<ViewStyle>;
  size?: number;
};

const LANDSCAPE_ADJUSTMENT_FACTOR = 0.75;

export const OrientationAwareIcon = (props: Props) => {
  const { orientation } = useContext(OrientationContext);
  const {
    Icon,
    iconStyle,
    landscapeIconStyle,
    landscapeStyle,
    size = normalize(24),
    style
  } = props;

  if (orientation !== 'landscape' && !device.isTablet) {
    return <Icon {...props} />;
  }

  const adjustedSize = size * LANDSCAPE_ADJUSTMENT_FACTOR;

  if (orientation !== 'landscape' && device.isTablet) {
    return <Icon {...props} iconStyle={[iconStyle, { width: adjustedSize }]} size={adjustedSize} />;
  }

  return (
    <Icon
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
