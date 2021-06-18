import React from 'react';

import { consts, device } from '../config';
import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';

type Props = {
  title: string;
  onPress?: () => void;
};

export const SectionHeader = ({ title, onPress }: Props) => {
  const innerComponent = <Title>{title}</Title>;

  return (
    <>
      <TitleContainer>
        {onPress ? (
          <Touchable
            onPress={onPress}
            accessibilityLabel={`${consts.a11yLabel.heading} ${consts.a11yLabel.button}(${title})`}
          >
            {innerComponent}
          </Touchable>
        ) : (
          innerComponent
        )}
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
    </>
  );
};
