import { StackHeaderLeftButtonProps } from '@react-navigation/stack';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';

export const HeaderLeft = ({ onPress, backImage }: StackHeaderLeftButtonProps) =>
  onPress ? (
    <View>
      <TouchableOpacity
        onPress={onPress}
        accessibilityLabel={consts.a11yLabel.backIcon}
        accessibilityHint={consts.a11yLabel.backIconHint}
      >
        {backImage ? (
          backImage({ tintColor: colors.lightestText })
        ) : (
          <Icon.ArrowLeft color={colors.lightestText} style={styles.icon} />
        )}
      </TouchableOpacity>
    </View>
  ) : null;

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(14)
  }
});
