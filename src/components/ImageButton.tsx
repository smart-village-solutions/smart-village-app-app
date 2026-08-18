import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';

import { Icon } from '../config';
import { resolveThemeOverrides } from '../helpers/appDesignSystemHelper';
import { useTheme } from '../hooks/useTheme';

import { Button } from './Button';
import { Wrapper } from './Wrapper';

export type TImageButtonStyle = {
  big?: boolean;
  dark?: Partial<TImageButtonStyle>;
  disabled?: boolean;
  iconColor?: string;
  iconPosition?: 'left' | 'right';
  invert?: boolean;
  lightest?: boolean;
  notFullWidth?: boolean;
  small?: boolean;
  smallest?: boolean;
};

export type TImageButton = {
  dark?: Partial<TImageButton>;
  iconName?: keyof typeof Icon;
  params?: {
    query?: string;
    [key: string]: unknown;
  };
  routeName: string;
  style?: TImageButtonStyle;
  title?: string;
};

export const ImageButton = ({ button }: { button: TImageButton }) => {
  const { mode } = useTheme();
  const themedButton = useMemo(() => resolveThemeOverrides(button, mode), [button, mode]);
  const { iconName, params, routeName, style = {}, title } = themedButton;
  const {
    big,
    disabled,
    iconColor,
    iconPosition,
    invert,
    lightest,
    notFullWidth,
    small,
    smallest
  } = style;

  const SelectedIcon = Icon[iconName as keyof typeof Icon];
  const navigation = useNavigation();

  if (!params || !routeName) {
    return null;
  }

  return (
    <Wrapper noPaddingTop noPaddingBottom>
      <Button
        icon={!!iconName && <SelectedIcon color={iconColor} />}
        title={title}
        onPress={() => navigation.navigate(routeName, params)}
        {...{ big, disabled, iconPosition, invert, lightest, notFullWidth, small, smallest }}
      />
    </Wrapper>
  );
};
