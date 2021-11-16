import React from 'react';
import { ShareContent, StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';
import { openShare } from '../helpers';

type Props = {
  shareContent?: ShareContent;
  style?: StyleProp<ViewStyle>;
};

export const ShareHeader = ({ shareContent, style }: Props) => {
  if (!shareContent) {
    return null;
  }

  return (
    !!shareContent && (
      <TouchableOpacity
        onPress={() => openShare(shareContent)}
        accessibilityLabel={consts.a11yLabel.shareIcon}
        accessibilityHint={consts.a11yLabel.shareHint}
      >
        <Icon.Share color={colors.lightestText} style={style} />
      </TouchableOpacity>
    )
  );
};
