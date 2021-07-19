import React, { useContext } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';

import { consts, device, IconProps, normalize } from '../config';
import { OrientationContext } from '../OrientationProvider';

type Props = IconProps & {
  Icon: (props: IconProps) => JSX.Element;
  landscapeStyle?: StyleProp<ViewStyle>;
  size: number;
};

const LANDSCAPE_ADJUSTMENT_FACTOR = 0.75;

export const OrientationAwareIcon = (props: Props) => {
  const { orientation, dimensions } = useContext(OrientationContext);
  const { Icon, iconStyle, landscapeStyle, size, style } = props;

  const needLandscapeStyle =
    orientation === 'landscape' || dimensions.width > consts.DIMENSIONS.FULL_SCREEN_MAX_WIDTH;

  // we need adjustments only on iOS, so otherwise just return the item with the usual props
  if (!needLandscapeStyle || !(device.platform === 'ios')) {
    return <Icon {...props} />;
  }

  const adjustedSize = size * LANDSCAPE_ADJUSTMENT_FACTOR;

  const landscapeIconStyle = { width: adjustedSize };

  return (
    <Icon
      {...props}
      iconStyle={[iconStyle, styles.marginIcon, landscapeIconStyle]}
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
