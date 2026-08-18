import React from 'react';
import { ShareContent, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { openShare } from '../helpers';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
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

  if (!shareContent) {
    return null;
  }

  return (
    !!shareContent && (
      <TouchableOpacity
        onPress={() => openShare(shareContent)}
        accessibilityLabel={label || a11yLabel.shareIcon}
        accessibilityHint={a11yLabel.shareHint}
        accessibilityRole="button"
        style={buttonStyle}
      >
        <Icon.Share
          color={label ? colors.primary : colors.darkText}
          style={style}
          hasNoHitSlop
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
        {!!label && <RegularText primary>{label}</RegularText>}
      </TouchableOpacity>
    )
  );
};
