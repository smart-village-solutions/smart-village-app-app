import { DrawerNavigationProp } from 'expo-router/drawer';
import React from 'react';
import { StyleProp, ViewStyle } from 'react-native';

import { consts, Icon } from '../config';
import { useHeaderForeground } from '../hooks/useHeaderForeground';

import { HEADER_RIGHT_ICON_SIZE, HEADER_RIGHT_ICON_STROKE_WIDTH } from './headerIconConfig';
import { HeaderIconButton } from './HeaderIconButton';

const { a11yLabel } = consts;

type Props = {
  navigation: DrawerNavigationProp<Record<string, object | undefined>>;
  style: StyleProp<ViewStyle>;
};

export const DrawerHeader = ({ navigation, style }: Props) => {
  const foreground = useHeaderForeground();

  return (
    <HeaderIconButton
      onPress={() => navigation.openDrawer()}
      accessibilityLabel={a11yLabel.openMenuIcon}
      accessibilityHint={a11yLabel.openMenuHint}
    >
      <Icon.DrawerMenu
        color={foreground}
        size={HEADER_RIGHT_ICON_SIZE}
        style={style}
        strokeWidth={HEADER_RIGHT_ICON_STROKE_WIDTH}
      />
    </HeaderIconButton>
  );
};
