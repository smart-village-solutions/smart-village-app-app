import React from 'react';

import { consts, device } from '../config';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';

type Props = {
  title: string;
  onPress?: () => void;
};

export const SectionHeader = ({ title, onPress }: Props) => {
  const a11yText = consts.a11yLabel;
  const innerComponent = (
    <Title accessibilityLabel={(`${title}`, a11yText.heading, a11yText.button)}>{title}</Title>
  );

  return (
    <>
      <TitleContainer>
        {onPress ? <Touchable onPress={onPress}>{innerComponent}</Touchable> : innerComponent}
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
    </>
  );
};
//Fix:accessibilityLabel
