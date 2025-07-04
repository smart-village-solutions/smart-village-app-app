import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, device, Icon, normalize } from '../config';
import { ScreenName } from '../types';

const { a11yLabel } = consts;

type Props = {
  navigation: StackNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const SearchHeader = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate({
          name: ScreenName.Search
        })
      }
      accessibilityLabel={a11yLabel.searchIcon}
      accessibilityHint={a11yLabel.searchHint}
    >
      <Icon.Search
        color={colors.darkerPrimary}
        style={[style, styles.icon]}
        strokeWidth={device.platform === 'ios' ? 1.3 : undefined}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(3)
  }
});
