import React from 'react';

import { texts } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { WrapperRow } from '../../Wrapper';

type Props = {
  license?: string;
};

export const LicenseSection = ({ license }: Props) => {
  if (!license) {
    return null;
  }

  return (
    <WrapperRow>
      <BoldText>{texts.oparl.licenseSection.license}</BoldText>
      <RegularText selectable>{license}</RegularText>
    </WrapperRow>
  );
};
