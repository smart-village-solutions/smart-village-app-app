import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { consts, Icon, normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel } = consts;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const EditHeader = ({ onPress, style }: Props) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={a11yLabel.editIcon}
      accessibilityHint={a11yLabel.editHint}
    >
      <Icon.EditSetting
        color={colors.darkText}
        style={style}
        size={normalize(22)}
        hasNoHitSlop
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </TouchableOpacity>
  );
};
