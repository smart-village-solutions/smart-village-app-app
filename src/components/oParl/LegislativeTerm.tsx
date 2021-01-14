import React from 'react';
import { NavigationScreenProp } from 'react-navigation';

import { texts } from '../../config';
import { LegislativeTermData } from '../../types';
import { BoldText, RegularText } from '../Text';
import { Wrapper, WrapperRow } from '../Wrapper';
import { BodySection, DateSection, KeywordSection, WebRepresentation } from './sections';

type Props = {
  data: LegislativeTermData;
  navigation: NavigationScreenProp<never>;
};

const { legislativeTerm } = texts.oparl;

export const LegislativeTerm = ({ data, navigation }: Props) => {
  const { body, endDate, keyword, name, startDate, web } = data;
  return (
    <Wrapper>
      {name && (
        <WrapperRow>
          <BoldText>{legislativeTerm.name}</BoldText>
          <RegularText>{name}</RegularText>
        </WrapperRow>
      )}
      <DateSection endDate={endDate} startDate={startDate} />
      <BodySection body={body} navigation={navigation} />
      <KeywordSection keyword={keyword} />
      <WebRepresentation name={name ?? legislativeTerm.title} navigation={navigation} web={web} />
    </Wrapper>
  );
};
