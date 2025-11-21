import { HeaderBackButtonProps } from '@react-navigation/elements';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';

import { HeadlineText } from './Text';

// TODO: can this be exchanged with https://reactnavigation.org/docs/elements/#headerbackbutton?
export const HeaderLeft = ({
  onPress,
  backImage,
  text
}: HeaderBackButtonProps & { text?: string }) => {
  if (!onPress && !backImage && !text) {
    return null;
  }

  if (!onPress) {
    return (
      <View>
        {backImage ? (
          backImage({ tintColor: colors.darkText })
        ) : text ? (
          <HeadlineText placeholder smaller style={styles.text}>
            {text}
          </HeadlineText>
        ) : null}
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityLabel={text ? text : consts.a11yLabel.backIcon}
      accessibilityHint={consts.a11yLabel.backIconHint}
    >
      {backImage ? (
        backImage({ tintColor: colors.darkText })
      ) : text ? (
        <HeadlineText lightest smaller style={styles.text}>
          {text}
        </HeadlineText>
      ) : (
        <Icon.ArrowLeft color={colors.darkText} style={styles.icon} />
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
