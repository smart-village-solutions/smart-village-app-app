import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';

const { a11yLabel } = consts;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const EditHeader = ({ onPress, style }: Props) => (
  <TouchableOpacity
    onPress={onPress}
    accessibilityLabel={a11yLabel.editIcon}
    accessibilityHint={a11yLabel.editHint}
  >
    <Icon.EditSetting color={colors.lightestText} style={style} size={normalize(22)} hasNoHitSlop />
  </TouchableOpacity>
);
