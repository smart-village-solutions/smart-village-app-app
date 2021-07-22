import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';
import { openShare } from '../helpers';

type Props = {
  headerRight?: boolean;
  // the type of shareContent should be react-native's ShareContent
  shareContent?: {
    message: string;
    title: string;
    url: string;
  };
};

export const ShareHeader = ({ headerRight, shareContent }: Props) => {
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
        <Icon.Share
          color={colors.lightestText}
          style={headerRight ? styles.iconLeft : styles.iconRight}
        />
      </TouchableOpacity>
    )
  );
};

const styles = StyleSheet.create({
  iconLeft: {
    paddingLeft: normalize(14),
    paddingRight: normalize(7)
  },
  iconRight: {
    paddingLeft: normalize(7),
    paddingRight: normalize(14)
  }
});
