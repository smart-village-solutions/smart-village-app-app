import React from 'react';
import { View } from 'react-native';

import { device } from '../../config';
import { Address, Contact, WebUrl } from '../../types';
import { InfoCard } from '../infoCard';
import { Logo } from '../Logo';
import { Title, TitleContainer, TitleShadow } from '../Title';
import { Wrapper } from '../Wrapper';

type Props = {
  title: string;
  logo?: string;
  operatingCompany?: {
    address?: Address;
    name?: string;
    contact?: Contact;
    webUrls?: WebUrl;
  };
  openWebScreen: (link: string) => void;
};

export const OperatingCompany = ({ title, logo, operatingCompany, openWebScreen }: Props) => {
  if (!operatingCompany) {
    return null;
  }

  return (
    <View>
      <TitleContainer>
        <Title accessibilityLabel={`${title} (Überschrift)`}>{title}</Title>
      </TitleContainer>
      {device.platform === 'ios' && <TitleShadow />}
      {!!logo && <Logo source={{ uri: logo }} />}
      <Wrapper>
        <InfoCard
          address={operatingCompany.address}
          contact={operatingCompany.contact}
          name={operatingCompany.name}
          openWebScreen={openWebScreen}
        />
      </Wrapper>
    </View>
  );
};
