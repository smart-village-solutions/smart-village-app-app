import React, { useState } from 'react';

import { Address, Contact, WebUrl } from '../../types';
import { Logo } from '../Logo';
import { SectionHeader } from '../SectionHeader';
import { Wrapper, WrapperVertical } from '../Wrapper';
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
  const [failedLogoUrl, setFailedLogoUrl] = useState<string>();

  if (!operatingCompany) {
    return null;
  }

  const logoUrl = logo?.trim();

  return (
    <WrapperVertical>
      <SectionHeader title={title} />
      <Wrapper>
        {!!logoUrl && failedLogoUrl !== logoUrl && (
          <Logo source={{ uri: logoUrl }} onError={() => setFailedLogoUrl(logoUrl)} />
        )}

        <InfoCard
          address={operatingCompany.address}
          contact={operatingCompany.contact}
          name={operatingCompany.name}
          openWebScreen={openWebScreen}
          showOpeningTimes={false}
        />
      </Wrapper>
    </WrapperVertical>
  );
};
