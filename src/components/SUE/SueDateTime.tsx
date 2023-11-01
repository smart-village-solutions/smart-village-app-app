import React from 'react';
import { Divider } from 'react-native-elements';

import { texts } from '../../config';
import { momentFormat } from '../../helpers';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperHorizontal } from '../Wrapper';

export const SueDatetime = ({ requestedDatetime }: { requestedDatetime: string }) => {
  return (
    <>
      <Wrapper>
        <BoldText>{texts.sue.datetime}</BoldText>
        <RegularText>{momentFormat(requestedDatetime, 'DD.MM.YYYY[,] HH:mm [Uhr]')}</RegularText>
      </Wrapper>

      <WrapperHorizontal>
        <Divider />
      </WrapperHorizontal>
    </>
  );
};
