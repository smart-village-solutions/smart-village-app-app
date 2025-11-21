import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { colors, consts, Icon } from '../config';

const { a11yLabel } = consts;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const DrawerHeader = ({ navigation, style }: Props) => {
  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      accessibilityLabel={a11yLabel.openMenuIcon}
      accessibilityHint={a11yLabel.openMenuHint}
    >
      <Icon.DrawerMenu color={colors.darkText} style={style} />
    </TouchableOpacity>
  );
};
