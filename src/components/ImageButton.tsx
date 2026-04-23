import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';

import { Icon, normalize } from '../config';
import { navigateToRoute } from '../helpers';
import { QUERY_TYPES } from '../queries';
import { myRequests } from '../queries/SUE';

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
    lightest?: boolean;
    notFullWidth?: boolean;
    small?: boolean;
    smallest?: boolean;
  };
  targetTabIndex?: number;
  title?: string;
};

export const ImageButton = ({ button }: { button: TImageButton }) => {
  const { iconName, params, routeName, style = {}, targetTabIndex, title } = button;
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

  // Hide buttons that require saved reports until the async check completes
  const [isVisible, setIsVisible] = useState(params?.query !== QUERY_TYPES.SUE.MY_REQUESTS);

  useEffect(() => {
    if (params?.query !== QUERY_TYPES.SUE.MY_REQUESTS) return;

    myRequests().then((reports) => {
      setIsVisible(!!reports?.length);
    });
  }, [params?.query]);

  if (!params || !routeName) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <Wrapper noPaddingTop noPaddingBottom>
      <Button
        icon={!!iconName && <SelectedIcon color={iconColor} size={normalize(16)} />}
        title={title}
        onPress={() => navigateToRoute({ navigation, params, routeName, targetTabIndex })}
        {...{ big, disabled, iconPosition, invert, lightest, notFullWidth, small, smallest }}
      />
    </Wrapper>
  );
};
