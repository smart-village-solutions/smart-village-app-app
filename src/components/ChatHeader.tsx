import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';

const a11yText = consts.a11yLabel;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const ChatHeader = ({ onPress, style }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={a11yText.chatIcon}
    accessibilityHint={a11yText.chatHint}
  >
    <Icon.Pen color={colors.lightestText} style={style} size={normalize(20)} />
  </TouchableOpacity>
);
