import { HeaderBackButtonProps } from '@react-navigation/elements';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';

// TODO: can this be exchanged with https://reactnavigation.org/docs/elements/#headerbackbutton?
export const HeaderLeft = ({ onPress, backImage }: HeaderBackButtonProps) =>
  onPress ? (
    <View>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={consts.a11yLabel.backIcon}
        accessibilityHint={consts.a11yLabel.backIconHint}
      >
        {backImage ? (
          backImage({ tintColor: colors.darkText })
        ) : (
          <Icon.ArrowLeft color={colors.darkText} style={styles.icon} />
        )}
      </TouchableOpacity>
    </View>
  ) : null;

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
