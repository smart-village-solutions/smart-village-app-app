import React from 'react';
import { ShareContent, StyleProp, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { openShare } from '../helpers';
import { useTheme } from '../hooks/useTheme';
import { useHeaderForeground } from '../hooks/useHeaderForeground';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';
import { RegularText } from './Text';

const { a11yLabel } = consts;

type Props = {
  buttonStyle?: StyleProp<ViewStyle>;
  label?: string;
  shareContent?: ShareContent;
  style?: StyleProp<ViewStyle>;
};

export const ShareHeader = ({ buttonStyle, label, shareContent, style }: Props) => {
  const { colors } = useTheme();
  const foreground = useHeaderForeground(label ? colors.primary : colors.text);

  if (!shareContent) {
    return null;
  }

  return (
    !!shareContent && (
      <HeaderIconButton
        onPress={() => openShare(shareContent)}
        accessibilityLabel={label || a11yLabel.shareIcon}
        accessibilityHint={a11yLabel.shareHint}
        style={buttonStyle}
      >
        <Icon.Share
          color={foreground}
          size={HEADER_RIGHT_ICON_SIZE}
          style={style}
          hasNoHitSlop
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
        {!!label && (
          <RegularText primary style={{ color: foreground }}>
            {label}
          </RegularText>
        )}
      </HeaderIconButton>
    )
  );
};
