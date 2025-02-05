import { HeaderBackButtonProps } from '@react-navigation/elements';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, device, Icon, normalize } from '../config';

import { HeadlineText } from './Text';

// TODO: can this be exchanged with https://reactnavigation.org/docs/elements/#headerbackbutton?
export const HeaderLeft = ({
  onPress,
  backImage,
  text
}: HeaderBackButtonProps & { text?: string }) => {
  if (!onPress && !backImage) {
    return device.platform == 'android' ? <Icon.ArrowLeft color={colors.surface} /> : null;
  }

  if (!onPress && backImage) {
    return <View>{backImage({ tintColor: colors.darkText })}</View>;
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={text ? text : consts.a11yLabel.backIcon}
      accessibilityHint={consts.a11yLabel.backIconHint}
    >
      {backImage ? (
        backImage({ tintColor: colors.lightestText })
      ) : text ? (
        <HeadlineText lightest smaller style={styles.text}>
          {text}
        </HeadlineText>
      ) : (
        <Icon.ArrowLeft color={colors.lightestText} style={styles.icon} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  },
  text: {
    paddingHorizontal: normalize(14)
  }
});
