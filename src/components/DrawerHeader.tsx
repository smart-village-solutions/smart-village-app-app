import { DrawerNavigationProp } from '@react-navigation/drawer';
import React from 'react';
import { StyleProp, TouchableOpacity, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';

const { a11yLabel } = consts;

type Props = {
  navigation: DrawerNavigationProp<any>;
  style: StyleProp<ViewStyle>;
};

export const DrawerHeader = ({ navigation, style }: Props) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => navigation.openDrawer()}
      accessibilityLabel={a11yLabel.openMenuIcon}
      accessibilityHint={a11yLabel.openMenuHint}
      accessibilityRole="button"
    >
      <Icon.DrawerMenu
        color={colors.darkText}
        style={style}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </TouchableOpacity>
  );
};
