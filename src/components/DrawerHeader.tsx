import { DrawerNavigationProp } from 'expo-router/drawer';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { useTheme } from '../hooks/useTheme';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel } = consts;

type Props = {
  navigation: DrawerNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const DrawerHeader = ({ navigation, style }: Props) => {
  const { colors } = useTheme();

  return (
    <HeaderIconButton
      onPress={() => navigation.openDrawer()}
      accessibilityLabel={a11yLabel.openMenuIcon}
      accessibilityHint={a11yLabel.openMenuHint}
    >
      <Icon.DrawerMenu
        color={colors.darkText}
        size={HEADER_RIGHT_ICON_SIZE}
        style={style}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
