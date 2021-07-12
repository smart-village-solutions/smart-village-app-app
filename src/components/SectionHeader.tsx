import React from 'react';

import { consts, device } from '../config';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';

type Props = {
  title: string;
  onPress?: () => void;
};

export const SectionHeader = ({ title, onPress }: Props) => {
  const innerComponent = (
    <Title
      accessibilityLabel={`(${title}) ${consts.a11yLabel.heading} ${
        onPress ? consts.a11yLabel.button : null
      } `}
    >
      {title}
    </Title>
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
