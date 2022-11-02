import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';

const a11yText = consts.a11yLabel;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const EditHeader = ({ onPress, style }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={a11yText.editIcon}
    accessibilityHint={a11yText.editHint}
  >
    <Icon.EditSetting color={colors.lightestText} style={style} />
  </TouchableOpacity>
);
