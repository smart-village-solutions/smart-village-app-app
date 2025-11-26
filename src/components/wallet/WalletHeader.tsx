import React from 'react';
import { StyleSheet } from 'react-native';

import { colors, Icon, normalize } from '../../config';
import { HeadlineText, RegularText } from '../Text';
import { Wrapper, WrapperVertical } from '../Wrapper';

type TWalletHeader = {
  iconBackgroundColor: string;
  iconColor: string;
  iconName: string;
  type: string;
  description?: string;
};

export const WalletHeader = ({
  description = '',
  iconBackgroundColor = colors.lighterPrimaryRgba,
  iconColor = colors.primary,
  iconName = 'credit-card',
  type = ''
}: TWalletHeader) => {
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

const styles = StyleSheet.create({
  iconContainer: {
    alignSelf: 'center',
    borderRadius: normalize(50)
  }
});
