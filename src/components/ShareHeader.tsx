import React from 'react';
import { ShareContent, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';
import { openShare } from '../helpers';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel } = consts;

type Props = {
  shareContent?: ShareContent;
  style: StyleProp<ViewStyle>;
};

export const ShareHeader = ({ shareContent, style }: Props) => {
  if (!shareContent) {
    return null;
  }

  return (
    !!shareContent && (
      <TouchableOpacity
        onPress={() => openShare(shareContent)}
        accessibilityLabel={a11yLabel.shareIcon}
        accessibilityHint={a11yLabel.shareHint}
        accessibilityRole="button"
      >
        <Icon.Share
          color={colors.darkText}
          style={style}
          hasNoHitSlop
          strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
        />
      </TouchableOpacity>
    )
  );
};
