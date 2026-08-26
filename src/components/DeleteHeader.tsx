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

export const DeleteHeader = ({ onPress, style }: Props) => {
  const { colors } = useTheme();

  return (
    <HeaderIconButton
      onPress={onPress}
      accessibilityLabel={a11yLabel.deleteIcon}
      accessibilityHint={a11yLabel.deleteHint}
    >
      <Icon.NamedIcon
        name="trash"
        color={colors.darkText}
        size={HEADER_RIGHT_ICON_SIZE}
        style={style}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
