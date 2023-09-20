import React from 'react';

import { texts } from '../../config';
import { SectionHeader } from '../SectionHeader';
import { CategoryText } from '../Text';
import { Wrapper } from '../Wrapper';

type StationProps = {
  freeBikeStatusUrl: string;
  id: string;
  isVirtualStation: string;
  regionId: string;
  shortName: string;
};

export const AvailableVehicles = ({
  availableVehicles,
  categoryName
}: {
  availableVehicles: StationProps;
  categoryName?: string;
}) => {
  return (
    <>
      {!!categoryName && (
        <Wrapper>
          <CategoryText large>{categoryName}</CategoryText>
        </Wrapper>
      )}

      <SectionHeader title={texts.pointOfInterest.availableBikes} />
    </>
  );
};
