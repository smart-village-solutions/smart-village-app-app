import React from 'react';
import { View } from 'react-native';

import { Address, Contact, WebUrl } from '../../types';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { Wrapper } from '../Wrapper';
import { InfoCard } from '../infoCard';

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
      <SectionHeader title={title} />
      <Wrapper>
        {!!logo && <Logo source={{ uri: logo }} />}

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
