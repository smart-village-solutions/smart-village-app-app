import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';

const a11yText = consts.a11yLabel;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const DrawerHeader = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      accessibilityLabel={a11yText.openMenuIcon}
      accessibilityHint={a11yText.openMenuHint}
    >
      <Icon.DrawerMenu color={colors.lightestText} style={style} />
    </TouchableOpacity>
  );
};
