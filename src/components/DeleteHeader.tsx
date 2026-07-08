import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel } = consts;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const DeleteHeader = ({ onPress, style }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={a11yLabel.deleteIcon}
    accessibilityHint={a11yLabel.deleteHint}
    accessibilityRole="button"
  >
    <Icon.NamedIcon
      name="trash"
      color={colors.darkText}
      style={style}
      strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
    />
  </TouchableOpacity>
);
