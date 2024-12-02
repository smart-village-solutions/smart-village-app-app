import React from 'react';
import { ShareContent, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';
import { openShare } from '../helpers';

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
      >
        <Icon.Share color={colors.darkText} style={style} hasNoHitSlop />
      </TouchableOpacity>
    )
  );
};
