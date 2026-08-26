import { HeaderBackButtonProps } from 'expo-router/react-navigation';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { consts, Icon, normalize } from '../config';
import { useTheme } from '../hooks/useTheme';

import { HeadlineText } from './Text';
import { HeaderIconButton } from './HeaderIconButton';
import { HEADER_RIGHT_ICON_SIZE } from './headerIconConfig';

// TODO: can this be exchanged with https://reactnavigation.org/docs/elements/#headerbackbutton?
export const HeaderLeft = ({
  onPress,
  backImage,
  text
}: HeaderBackButtonProps & { text?: string }) => {
  const { colors } = useTheme();

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
    <HeaderIconButton
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
        <Icon.ArrowLeft color={colors.darkText} size={HEADER_RIGHT_ICON_SIZE} style={styles.icon} />
      )}
    </HeaderIconButton>
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
