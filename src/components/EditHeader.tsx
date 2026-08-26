import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel } = consts;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const EditHeader = ({ onPress, style }: Props) => {
  const { colors } = useTheme();

  return (
    <HeaderIconButton
      onPress={onPress}
      accessibilityLabel={a11yLabel.editIcon}
      accessibilityHint={a11yLabel.editHint}
    >
      <Icon.EditSetting
        color={colors.darkText}
        style={style}
        size={HEADER_RIGHT_ICON_SIZE}
        hasNoHitSlop
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
