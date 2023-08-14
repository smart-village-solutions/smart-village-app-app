import React, { useContext } from 'react';

import { consts, device } from '../config';
import { SettingsContext } from '../SettingsProvider';

import { Title, TitleContainer, TitleShadow } from './Title';
import { Touchable } from './Touchable';

type Props = {
  big?: boolean;
  center?: boolean;
  onPress?: () => void;
  title: string;
};

export const SectionHeader = ({ big = false, center = false, onPress, title }: Props) => {
  const { globalSettings } = useContext(SettingsContext);
  const { settings = {} } = globalSettings;
  const { flat = false } = settings;

  if (!title) return null;

  const innerComponent = (
    <Title
      accessibilityLabel={`(${title}) ${consts.a11yLabel.heading} ${
        onPress ? consts.a11yLabel.button : ''
      } `}
      big={big}
      center={center}
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
