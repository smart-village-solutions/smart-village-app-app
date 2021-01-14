import React from 'react';

import { texts } from '../../../config';
import { BoldText, RegularText } from '../../Text';
import { WrapperWrap } from '../../Wrapper';

export const KeywordSection = ({ keyword }: { keyword?: string[] }) => {
  if (!keyword || !keyword.length) {
    return null;
  }

  const keywordString = keyword.join(', ');

  return (
    <>
      <WrapperWrap>
        <BoldText>{texts.oparl.keywords}</BoldText>
        <RegularText>{keywordString}</RegularText>
      </WrapperWrap>
    </>
  );
};
