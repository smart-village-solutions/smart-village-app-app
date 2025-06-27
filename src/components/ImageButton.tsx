import { useNavigation } from '@react-navigation/native';
import React from 'react';

import { Icon } from '../config';

import { Button } from './Button';
import { Wrapper } from './Wrapper';

export type TImageButton = {
  iconName?: keyof typeof Icon;
  params?: any;
  routeName: string;
  style?: {
    big?: boolean;
    disabled?: boolean;
    iconColor?: string;
    iconPosition?: 'left' | 'right';
    invert?: boolean;
    notFullWidth?: boolean;
    small?: boolean;
    smallest?: boolean;
    whiteInvert?: boolean;
  };
  title?: string;
};

export const ImageButton = ({ button }: { button: TImageButton }) => {
  const { iconName, params, routeName, style = {}, title } = button;
  const {
    big,
    disabled,
    iconColor,
    iconPosition,
    invert,
    notFullWidth,
    small,
    smallest,
    whiteInvert
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
        {...{ big, disabled, iconPosition, invert, notFullWidth, small, smallest, whiteInvert }}
      />
    </Wrapper>
  );
};
