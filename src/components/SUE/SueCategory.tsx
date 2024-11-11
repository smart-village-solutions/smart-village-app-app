import React from 'react';

import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';

export const SueCategory = ({
  serviceName,
  requestedDatetime
}: {
  serviceName: string;
  requestedDatetime: string;
}) => {
  return (
    <Wrapper>
      <WrapperRow spaceBetween>
        <BoldText smallest>{serviceName}</BoldText>
        <RegularText smallest placeholder>
          {momentFormat(requestedDatetime)}
        </RegularText>
      </WrapperRow>
    </Wrapper>
  );
};
