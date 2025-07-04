import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, device, Icon, normalize } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';

const { a11yLabel } = consts;

type Props = {
  navigation: StackNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const SearchHeader = ({ navigation, style }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { search = {} } = settings;

  if (!search) return null;

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
