import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';

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
  >
    <Icon.Trash color={colors.darkText} style={style} />
  </TouchableOpacity>
);
