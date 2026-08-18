import React from 'react';
import 'react-native';

import { Icon, normalize } from '../../config';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperVertical } from '../Wrapper';
import { useThemeStyles } from '../../hooks/useThemeStyles';
import { useTheme } from '../../hooks/useTheme';

type TWalletHeader = {
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  type: string;
  description?: string;
};

export const WalletHeader = ({
  description = '',
  iconBackgroundColor: iconBackgroundColorProp,
  iconColor,
  iconName = 'credit-card',
  type = ''
}: TWalletHeader) => {
  const { colors: colors } = useTheme();

  const styles = useThemeStyles(createStyles);
  const iconBackgroundColor = iconBackgroundColorProp || colors.lighterPrimaryRgba;
  return (
    <>
      <Wrapper itemsCenter style={[styles.iconContainer, { backgroundColor: iconBackgroundColor }]}>
        <Icon.NamedIcon name={iconName} size={normalize(50)} color={iconColor} />
      </Wrapper>

      <Wrapper itemsCenter>
        <WrapperVertical>
          <HeadlineText biggest>{type}</HeadlineText>
        </WrapperVertical>

        <RegularText center>{description}</RegularText>
      </Wrapper>
    </>
  );
};

const createStyles = () => ({
  iconContainer: {
    alignSelf: 'center',
    borderRadius: normalize(50)
  }
});
