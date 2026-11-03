import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { useHeaderForeground } from '../hooks/useHeaderForeground';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel } = consts;

type Props = {
  onPress?: () => void;
  style: StyleProp<ViewStyle>;
};

export const EditHeader = ({ onPress, style }: Props) => {
  const foreground = useHeaderForeground();

  return (
    <HeaderIconButton
      onPress={onPress}
      accessibilityLabel={a11yLabel.editIcon}
      accessibilityHint={a11yLabel.editHint}
    >
      <Icon.EditSetting
        color={foreground}
        style={style}
        size={HEADER_RIGHT_ICON_SIZE}
        hasNoHitSlop
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
