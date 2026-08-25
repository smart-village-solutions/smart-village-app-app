import { useNavigation } from 'expo-router/react-navigation';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { ConfigurationsContext } from '../ConfigurationsProvider';
import { Icon, normalize } from '../config';
import {
  navigateToRoute,
  resolveThemeOverrides,
  shouldShowInternalSuePendingStatus
} from '../helpers';
import { useTheme } from '../hooks/useTheme';
import { QUERY_TYPES } from '../queries';
import { myRequests } from '../queries/SUE';

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
  targetTabIndex?: number;
  title?: string;
};

export const ImageButton = ({ button }: { button: TImageButton }) => {
  const { sueConfig = {} } = useContext(ConfigurationsContext);
  const { mode } = useTheme();
  const themedButton = useMemo(() => resolveThemeOverrides(button, mode), [button, mode]);
  const { iconName, params, routeName, style = {}, targetTabIndex, title } = themedButton;
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
  const showInternalPendingStatus = shouldShowInternalSuePendingStatus(
    sueConfig.showInternalPendingStatus
  );

  // Hide buttons that require saved reports until the async check completes
  const [isVisible, setIsVisible] = useState(params?.query !== QUERY_TYPES.SUE.MY_REQUESTS);

  useEffect(() => {
    if (params?.query !== QUERY_TYPES.SUE.MY_REQUESTS) return;

    myRequests({ showInternalPendingStatus }).then((reports) => {
      setIsVisible(!!reports?.length);
    });
  }, [params?.query, showInternalPendingStatus]);

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
