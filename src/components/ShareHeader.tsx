import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors, device, normalize } from '../config';
import { openShare } from '../helpers';
import { share } from '../icons';
import { Icon } from './Icon';

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
        accessibilityLabel="Teilen Taste"
        accessibilityHint="Inhalte auf der Seite teilen"
      >
        {device.platform === 'ios' ? (
          <Icon
            name="ios-share"
            iconColor={colors.lightestText}
            style={headerRight ? styles.iconLeft : styles.iconRight}
          />
        ) : (
          <Icon
            xml={share(colors.lightestText)}
            style={headerRight ? styles.iconLeft : styles.iconRight}
          />
        )}
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
