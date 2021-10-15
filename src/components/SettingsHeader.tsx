import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const SettingsHeader = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.navigate('Settings')}
      accessibilityLabel={a11yText.settingsIcon}
      accessibilityHint={a11yText.settingsIconHint}
    >
      <Icon.Settings color={colors.lightestText} style={style} />
    </TouchableOpacity>
  );
};
