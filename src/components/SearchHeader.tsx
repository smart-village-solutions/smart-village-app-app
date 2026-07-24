import { StackNavigationProp } from '@react-navigation/stack';
import React, { useContext } from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon, normalize } from '../config';
import { SettingsContext } from '../SettingsProvider';
import { ScreenName } from '../types';
import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel } = consts;

type Props = {
  navigation: StackNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const SearchHeader = ({ navigation, style }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { search } = settings;

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
      accessibilityRole="button"
    >
      <Icon.Search
        color={colors.darkerPrimary}
        style={[style, styles.icon]}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icon: {
    paddingHorizontal: normalize(3)
  }
});
