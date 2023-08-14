import React, { useContext } from 'react';

import { consts, device } from '../config';
import { SettingsContext } from '../SettingsProvider';

import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';

type Props = {
  title: string;
  onPress?: () => void;
};

export const SectionHeader = ({ title, onPress }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { flat = false } = settings;

  const innerComponent = (
    <Title
      accessibilityLabel={`(${title}) ${consts.a11yLabel.heading} ${
        onPress ? consts.a11yLabel.button : ''
      } `}
    >
      {title}
    </Title>
  );

  return (
    <>
      <TitleContainer flat={flat}>
        {onPress ? <Touchable onPress={onPress}>{innerComponent}</Touchable> : innerComponent}
      </TitleContainer>
      {!flat && device.platform === 'ios' && <TitleShadow />}
    </>
  );
};
